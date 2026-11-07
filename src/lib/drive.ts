// Google Drive uploads for staff photos, using a Google Cloud service account.
// Env: GOOGLE_SERVICE_ACCOUNT_JSON (the key file's JSON) and GOOGLE_DRIVE_FOLDER_ID (a folder in a Shared Drive
// that the service account was added to as Content manager). Files go straight from the browser to Google,
// so large photos never pass through (or count against) the website's servers.
import "server-only";
import { GoogleAuth } from "google-auth-library";

export const driveReady = () => !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_DRIVE_FOLDER_ID);

let auth: GoogleAuth | undefined;
async function token() {
  auth ??= new GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!), scopes: ["https://www.googleapis.com/auth/drive"] });
  const t = await (await auth.getClient()).getAccessToken();
  if (!t.token) throw new Error("Couldn't authenticate with Google");
  return t.token;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

/** Finds or creates a sub-folder (by name) inside a parent folder. */
export async function ensureFolder(name: string, parentId = process.env.GOOGLE_DRIVE_FOLDER_ID!): Promise<string> {
  const t = await token();
  const qs = new URLSearchParams({
    q: `name = '${esc(name)}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)", supportsAllDrives: "true", includeItemsFromAllDrives: "true", corpora: "allDrives",
  });
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?${qs}`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json());
  if (found.files?.[0]?.id) return found.files[0].id;
  const created = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, parents: [parentId], mimeType: "application/vnd.google-apps.folder" }),
  }).then((r) => r.json());
  if (!created.id) throw new Error(created.error?.message ?? "Couldn't create the Drive folder");
  return created.id;
}

/** Starts a resumable upload; the browser then PUTs the file bytes directly to the returned URL. */
export async function startUpload(folderId: string, name: string, mimeType: string, size: number, origin: string): Promise<string> {
  const t = await token();
  const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true", {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": mimeType, "X-Upload-Content-Length": String(size), Origin: origin },
    body: JSON.stringify({ name, parents: [folderId] }),
  });
  const url = r.headers.get("location");
  if (!r.ok || !url) throw new Error(`Google Drive refused the upload (${r.status})`);
  return url;
}
