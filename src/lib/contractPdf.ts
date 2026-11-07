// Builds the signed contract PDF with the MacroSnaps header/footer on every page, both signatures and an audit certificate.
import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFImage } from "pdf-lib";
import { SITE } from "./site";
import { LOGO_PNG_BASE64 } from "./logoData";

export type ContractPdfInput = {
  id: number; title: string; version: string; sections: { title: string; body: string }[];
  signerName: string; signerEmail: string; signerPhone: string; signerAddress: string;
  signedName: string; signedAt: Date; signedIp: string; signedUa: string; signaturePng: string | null;
  companySigner: string; companySignedAt: Date; sentAt: Date; viewedAt: Date | null; viewedIp: string | null; docSha256: string;
};

const GOLD = rgb(0.8, 0.73, 0.34), INK = rgb(0.11, 0.11, 0.11), MUTED = rgb(0.42, 0.42, 0.42), BLACK = rgb(0, 0, 0);
const W = 612, H = 792, M = 56, HEADER = 92, FOOTER = 44;
export const CLOSING = "I have read and agree to the preceding terms and conditions.";

const clean = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[^\x20-\x7E\n]/g, "");
function wrap(text: string, font: PDFFont, size: number, width: number) {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const t = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
}
const fmt = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "long", timeStyle: "long" });
const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" });

/** The logo is embedded in the code, so building a PDF never needs the network. */
async function logo(pdf: PDFDocument): Promise<PDFImage | null> {
  try { return await pdf.embedPng(Buffer.from(LOGO_PNG_BASE64, "base64")); } catch { return null; }
}

export function validSignaturePng(dataUrl: string | null): boolean {
  if (!dataUrl?.startsWith("data:image/png;base64,")) return false;
  const b = Buffer.from(dataUrl.slice(22), "base64");
  if (b.length < 60 || b.length > 300_000) return false;
  const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!magic.every((v, i) => b[i] === v) || b.toString("ascii", 12, 16) !== "IHDR") return false;
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (!w || !h || w > 4000 || h > 2000 || b.toString("ascii", b.length - 8, b.length - 4) !== "IEND") return false;
  return true;
}

export async function buildContractPdf(c: ContractPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${c.title} - ${c.signerName}`);
  pdf.setAuthor("MacroHype LLC d/b/a MacroSnaps");
  pdf.setSubject(`Signed electronically. Document ID MS-C${c.id}`);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const script = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const logoImg = await logo(pdf);

  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;
  const header = (pg: PDFPage) => {
    pg.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: BLACK });
    if (logoImg) { const s = 54 / logoImg.height; pg.drawImage(logoImg, { x: M, y: H - 63, width: logoImg.width * s, height: 54 }); }
    else pg.drawText("MacroSnaps", { x: M, y: H - 45, size: 24, font: script, color: GOLD });
    const t = clean(c.title);
    pg.drawText(t, { x: W - M - script.widthOfTextAtSize(t, 15), y: H - 42, size: 15, font: script, color: GOLD });
    pg.drawRectangle({ x: 0, y: H - 74, width: W, height: 4, color: GOLD });
  };
  const newPage = () => { page = pdf.addPage([W, H]); pages.push(page); header(page); y = H - HEADER; };
  const need = (h: number) => { if (y - h < FOOTER + 24) newPage(); };
  const text = (s: string, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gap?: number; x?: number; width?: number; center?: boolean } = {}) => {
    const font = o.font ?? reg, size = o.size ?? 10.5, lh = size * 1.5, width = o.width ?? W - 2 * M - (o.x ?? 0);
    for (const line of wrap(s, font, size, width)) {
      need(lh);
      const x = o.center ? (W - font.widthOfTextAtSize(line, size)) / 2 : M + (o.x ?? 0);
      page.drawText(line, { x, y: y - size, size, font, color: o.color ?? INK });
      y -= lh;
    }
    y -= o.gap ?? 0;
  };
  /** "Label: value" with an underline, like the original form. */
  const field = (label: string, value: string, x: number, w: number) => {
    page.drawText(label, { x, y: y - 12, size: 12, font: reg, color: INK });
    const lx = x + reg.widthOfTextAtSize(label, 12) + 6;
    page.drawText(clean(value).slice(0, 80), { x: lx + 2, y: y - 11, size: 11, font: bold, color: INK });
    page.drawLine({ start: { x: lx, y: y - 15 }, end: { x: x + w, y: y - 15 }, thickness: 0.8, color: rgb(0.17, 0.42, 0.6) });
  };

  newPage();
  y -= 4;
  field("Contractor Full Legal Name:", c.signedName, M, W - 2 * M); y -= 28;
  field("Phone:", c.signerPhone, M, (W - 2 * M) / 2 - 12); field("Email:", c.signerEmail, M + (W - 2 * M) / 2 + 12, (W - 2 * M) / 2 - 12); y -= 28;
  field("Address:", c.signerAddress, M, W - 2 * M); y -= 34;

  let n = 0;
  for (const s of c.sections) {
    if (!s.title) { text(s.body, { gap: 12 }); continue; }
    if (n === 0) text("Terms and Conditions", { font: bold, size: 11.5, gap: 8 });
    n++;
    need(46);
    // Bold "N. Title:" followed by the clause on the same paragraph.
    const lead = `${n}. ${clean(s.title)}: `;
    const lw = bold.widthOfTextAtSize(lead, 10.5);
    const lines = wrap(s.body, reg, 10.5, W - 2 * M - lw);
    const first = lines.shift() ?? "";
    page.drawText(lead, { x: M, y: y - 10.5, size: 10.5, font: bold, color: INK });
    page.drawText(first, { x: M + lw, y: y - 10.5, size: 10.5, font: reg, color: INK });
    y -= 15.75;
    if (lines.length) text(lines.join(" "), { gap: 0 });
    y -= 10;
  }

  // Closing line and signature blocks
  need(200);
  y -= 6;
  text(CLOSING, { center: true, gap: 26 });
  const colW = (W - 2 * M - 40) / 2, top = y;
  const block = async (x: number, label: string, name: string, when: Date, kind: "image" | "type") => {
    let yy = top;
    page.drawText(label, { x, y: yy - 11, size: 11, font: bold, color: INK }); yy -= 20;
    page.drawText("Sign:", { x, y: yy - 46, size: 12, font: reg, color: INK });
    const sx = x + 38, sw = colW - 38;
    if (kind === "image" && validSignaturePng(c.signaturePng)) {
      const img = await pdf.embedPng(Buffer.from(c.signaturePng!.split(",")[1], "base64"));
      const s = Math.min(sw / img.width, 50 / img.height);
      page.drawImage(img, { x: sx, y: yy - 50, width: img.width * s, height: img.height * s });
    } else page.drawText(clean(name), { x: sx + 4, y: yy - 44, size: 22, font: script, color: INK });
    page.drawLine({ start: { x: sx, y: yy - 50 }, end: { x: x + colW, y: yy - 50 }, thickness: 0.8, color: rgb(0.17, 0.42, 0.6) });
    page.drawText(clean(name), { x: sx, y: yy - 62, size: 9, font: reg, color: MUTED });
    yy -= 84;
    page.drawText("Date:", { x, y: yy, size: 12, font: reg, color: INK });
    page.drawText(fmtDate(when), { x: sx + 4, y: yy + 1, size: 11, font: bold, color: INK });
    page.drawLine({ start: { x: sx, y: yy - 4 }, end: { x: x + colW, y: yy - 4 }, thickness: 0.8, color: rgb(0.17, 0.42, 0.6) });
  };
  await block(M, "CONTRACTOR", c.signedName, c.signedAt, "image");
  await block(M + colW + 40, "MACROHYPE LLC (D/B/A MACROSNAPS)", c.companySigner, c.companySignedAt, "type");
  y = top - 130;

  // Audit certificate
  newPage();
  text("Certificate of Completion", { font: serif, size: 20, gap: 4 });
  text(`Document ID MS-C${c.id} · ${c.title} (version ${c.version})`, { size: 9, color: MUTED, gap: 14 });
  const rows: [string, string][] = [
    ["Document fingerprint (SHA-256 of the agreement text)", c.docSha256],
    ["Sent and signed for MacroSnaps by", `${c.companySigner}, ${fmt(c.sentAt)}`],
    ["Sent to", `${c.signerName} <${c.signerEmail}>`],
    ["First viewed", c.viewedAt ? `${fmt(c.viewedAt)} from IP ${c.viewedIp ?? "unknown"}` : "Not recorded"],
    ["Consent", "Signer agreed to use electronic records and signatures (U.S. ESIGN Act / UETA)."],
    ["Signed by", `${c.signedName} <${c.signerEmail}>, phone ${c.signerPhone}`],
    ["Signed at", fmt(c.signedAt)],
    ["Signer IP address", c.signedIp || "unknown"],
    ["Signer device", c.signedUa.slice(0, 180) || "unknown"],
    ["Signature method", "Drawn signature + typed full legal name"],
  ];
  for (const [k, v] of rows) { text(k, { font: bold, size: 9, color: MUTED }); text(v, { size: 10, gap: 8 }); }
  text("The signer opened this document through a unique, private link sent to the email address above. Any change to the agreement text would change the document fingerprint.", { size: 8.5, color: MUTED });

  // Footer bar on every page (like the original letterhead) + page numbers.
  const foot = clean(`www.macrosnaps.com    ${SITE.phone}    ${SITE.email}    @macrosnaps`);
  pages.forEach((pg, i) => {
    pg.drawRectangle({ x: 0, y: 0, width: W, height: FOOTER - 14, color: BLACK });
    pg.drawRectangle({ x: 0, y: FOOTER - 14, width: W, height: 3, color: GOLD });
    pg.drawText(foot, { x: (W - reg.widthOfTextAtSize(foot, 9)) / 2, y: 11, size: 9, font: reg, color: GOLD });
    const pn = `Page ${i + 1} of ${pages.length} · MS-C${c.id}`;
    pg.drawText(pn, { x: W - M - reg.widthOfTextAtSize(pn, 7.5), y: FOOTER - 4, size: 7.5, font: reg, color: MUTED });
  });
  return pdf.save();
}
