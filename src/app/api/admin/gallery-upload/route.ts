// Issues short-lived upload tokens so the admin's browser can upload gallery photos straight to Vercel Blob.
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentUser, isManager } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Photo storage isn't connected yet." }, { status: 503 });
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const u = await currentUser();
        if (!u || !isManager(u) || !u.totp_enabled) throw new Error("Not allowed");
        if (!/^galleries\/\d+\/[\w.\- ()]+$/.test(pathname)) throw new Error("Bad file name");
        return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"], maximumSizeInBytes: 50 * 1024 * 1024, addRandomSuffix: true };
      },
      // Photos are recorded by the admin page right after upload, so nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
