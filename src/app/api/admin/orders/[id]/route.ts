// A past order as a branded one-page (or more) PDF.
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { currentUser, isManager } from "@/lib/auth";
import { q } from "@/lib/db";
import { SITE } from "@/lib/site";
import { LOGO_PNG_BASE64 } from "@/lib/logoData";
import type { OrderRow } from "@/app/admin/(panel)/orders/[id]/page";

export const dynamic = "force-dynamic";

const GOLD = rgb(0.8, 0.73, 0.34), INK = rgb(0.11, 0.11, 0.11), MUTED = rgb(0.42, 0.42, 0.42);
const W = 612, H = 792, M = 50;
const clean = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[^\x20-\x7E\n]/g, "");
const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || !isManager(u)) return new Response("Unauthorized", { status: 401 });
  const [o] = await q<OrderRow[]>`select * from orders where id = ${Number((await params).id) || 0}`;
  if (!o) return new Response("Not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(Buffer.from(LOGO_PNG_BASE64, "base64"));
  let page = pdf.addPage([W, H]);
  let y = H - M;
  const text = (t: string, x: number, size = 10, f = font, color = INK) => page.drawText(clean(t), { x, y, size, font: f, color });
  const need = (h: number) => { if (y - h < M + 30) { page = pdf.addPage([W, H]); y = H - M; } };

  // Header
  const lw = 110, lh = (logo.height / logo.width) * lw;
  page.drawRectangle({ x: 0, y: H - 20 - lh - 30, width: W, height: lh + 50, color: rgb(0, 0, 0) });
  page.drawImage(logo, { x: M, y: H - 25 - lh, width: lw, height: lh });
  page.drawText(`ORDER #${o.number ?? o.id}`, { x: W - M - bold.widthOfTextAtSize(`ORDER #${o.number ?? o.id}`, 16), y: H - 45, size: 16, font: bold, color: GOLD });
  const dt = o.created_at.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  page.drawText(dt, { x: W - M - font.widthOfTextAtSize(dt, 10), y: H - 62, size: 10, font, color: rgb(0.85, 0.85, 0.85) });
  page.drawRectangle({ x: 0, y: H - 20 - lh - 34, width: W, height: 4, color: GOLD });
  y = H - lh - 90;

  // Client and event
  const colL = M, colR = W / 2 + 10;
  const block = (x: number, title: string, lines: (string | null | undefined)[]) => {
    let yy = y;
    page.drawText(title, { x, y: yy, size: 8, font: bold, color: GOLD }); yy -= 15;
    for (const l of lines.filter(Boolean) as string[]) for (const w of wrap(l, font, 10, W / 2 - M - 10)) { page.drawText(w, { x, y: yy, size: 10, font, color: INK }); yy -= 13; }
    return yy;
  };
  const y1 = block(colL, "BILLED TO", [o.name, o.company, o.email, o.phone]);
  const y2 = block(colR, "EVENT", [o.event, o.location, o.event_date]);
  y = Math.min(y1, y2) - 18;

  // Items
  page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20, color: rgb(0.96, 0.95, 0.92) });
  y += 0; text("ITEM", M + 8, 8, bold, MUTED); text("QTY", W - M - 150, 8, bold, MUTED); text("PRICE", W - M - 70, 8, bold, MUTED);
  y -= 26;
  for (const it of o.items) {
    const opt = it.options ? wrap(it.options.replace(/; /g, "\n"), font, 8.5, W - 2 * M - 190) : [];
    need(16 + opt.length * 11);
    text(it.name, M + 8, 10, bold); text(String(it.qty), W - M - 150); text(money(it.price_cents), W - M - 70);
    y -= 13;
    for (const l of opt) { text(l, M + 8, 8.5, font, MUTED); y -= 11; }
    y -= 8;
    page.drawLine({ start: { x: M, y: y + 4 }, end: { x: W - M, y: y + 4 }, thickness: 0.5, color: rgb(0.88, 0.86, 0.8) });
    y -= 6;
  }

  // Totals
  need(110);
  const row = (k: string, v: string, b = false) => { text(k, W - M - 200, 10, b ? bold : font, b ? INK : MUTED); text(v, W - M - 70, 10, b ? bold : font); y -= 15; };
  row("Subtotal", money(o.subtotal_cents));
  if (o.discount_cents) row("Discount", `-${money(o.discount_cents)}`);
  if (o.tax_cents) row("Tax / fees", money(o.tax_cents));
  row("Total", money(o.total_cents), true);
  row("Paid", money(o.paid_cents));
  if (o.refunded_cents) row("Refunded", money(o.refunded_cents));
  if (o.balance_cents) row("Balance due", money(o.balance_cents), true);
  y -= 4; text(`Status: ${(o.payment_status ?? "").replace(/_/g, " ").toLowerCase()}`, W - M - 200, 9, font, MUTED); y -= 20;

  if (o.notes) {
    const nl = wrap(o.notes, font, 9.5, W - 2 * M);
    need(20 + nl.length * 12);
    text("NOTES", M, 8, bold, GOLD); y -= 14;
    for (const l of nl) { text(l, M, 9.5); y -= 12; }
  }

  // Footer on every page
  for (const p of pdf.getPages()) {
    const f = clean(`${SITE.name ?? "MacroSnaps"} · ${SITE.phone} · ${SITE.email} · macrosnaps.com`);
    p.drawText(f, { x: (W - font.widthOfTextAtSize(f, 8)) / 2, y: 26, size: 8, font, color: MUTED });
  }
  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="macrosnaps-order-${o.number ?? o.id}.pdf"`, "cache-control": "no-store" } });
}
