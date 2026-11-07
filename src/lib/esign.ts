// E-signature workflow: send a contract by secure link → signer views & signs → PDF with audit trail saved and emailed to both sides.
import "server-only";
import { createHash, randomBytes } from "crypto";
import { q, audit } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { ORIGIN } from "@/lib/emailTemplate";
import { contractToSign, contractSignedSigner, contractSignedTeam } from "@/lib/emails";
import { buildContractPdf } from "@/lib/contractPdf";
import { CONTRACT, CONTRACT_VERSION, CONTRACT_TITLE, CONTRACT_INTRO } from "@/data/contractorAgreement";
import { SITE } from "@/lib/site";
import { notifyAdmins } from "@/lib/notify";

export const DOC_TITLE = CONTRACT_TITLE;
const sha = (s: string | Uint8Array) => createHash("sha256").update(s).digest("hex");
export const signUrl = (token: string) => `${ORIGIN}/sign/${token}`;

export type ContractRow = {
  id: number; user_id: number | null; inquiry_id: number | null; signer_name: string; signer_email: string; doc_title: string; doc_version: string;
  doc_sections: { title: string; body: string }[]; company_signer: string; company_signed_at: Date; status: string; sent_at: Date;
  viewed_at: Date | null; viewed_ip: string | null; signed_at: Date | null; signed_name: string | null; signed_ip: string | null; signed_ua: string | null;
  signature_png: string | null; pdf_sha256: string | null; doc_sha256: string | null;
};
/** Creates a contract (signed by MacroSnaps at send time), emails the signing link, returns the id and link. */
export async function sendContract(o: { name: string; email: string; userId?: number | null; inquiryId?: number | null; companySigner: string; by: number | null; email_it?: boolean }) {
  const token = randomBytes(32).toString("base64url");
  // The intro paragraph is stored as an untitled first section (printed without a number).
  const sections = [{ title: "", body: CONTRACT_INTRO }, ...CONTRACT];
  const docSha = sha(JSON.stringify({ title: DOC_TITLE, version: CONTRACT_VERSION, sections }));
  // Only one open contract per person: void older unsigned ones.
  await q`update contracts set status = 'voided' where lower(signer_email) = ${o.email.toLowerCase()} and status in ('sent','viewed')`;
  const rows = await q<{ id: number }[]>`
    insert into contracts (user_id, inquiry_id, signer_name, signer_email, doc_title, doc_version, doc_sections, company_signer, token_hash, doc_sha256, created_by)
    values (${o.userId ?? null}, ${o.inquiryId ?? null}, ${o.name}, ${o.email.toLowerCase()}, ${DOC_TITLE}, ${CONTRACT_VERSION}, ${JSON.stringify(sections)}::jsonb, ${o.companySigner}, ${sha(token)}, ${docSha}, ${o.by})
    returning id`;
  const id = rows[0].id;
  const url = signUrl(token);
  let emailed = false;
  if (o.email_it !== false) {
    const m = contractToSign(o.name, o.companySigner, DOC_TITLE, url, `MS-C${id}`);
    const r = await sendMail({ to: o.email, subject: m.subject, html: m.html });

    emailed = r.ok;
  }
  await audit(o.by, "contract_sent", `MS-C${id} to ${o.email}`);
  return { id, url, emailed };
}

/** Records the first view (for the audit trail). */
export async function markViewed(id: number, ip: string) {
  const r = await q<{ id: number }[]>`update contracts set status = 'viewed', viewed_at = now(), viewed_ip = ${ip} where id = ${id} and status = 'sent' returning id`;
  if (r.length) await notifyAdmins("A contract was opened", `Document MS-C${id} was viewed by the signer.`, "/admin/contracts").catch(() => null);
}

/** Signs the contract, builds and stores the PDF, emails both parties. */
export async function signContract(token: string, s: { name: string; phone: string; address: string; signaturePng: string | null; ip: string; ua: string }) {
  const c = await getContract(token);
  if (!c) return { error: "This signing link isn't valid." };
  if (c.status === "signed") return { error: "This contract is already signed." };
  if (c.status === "voided") return { error: "This contract was cancelled. Please contact MacroSnaps for a new link." };
  const signedAt = new Date();
  const docSha = c.doc_sha256 ?? sha(JSON.stringify({ title: c.doc_title, version: c.doc_version, sections: c.doc_sections }));
  const pdf = await buildContractPdf({
    id: c.id, title: c.doc_title, version: c.doc_version, sections: c.doc_sections, signerName: c.signer_name, signerEmail: c.signer_email,
    signerPhone: s.phone, signerAddress: s.address, signedName: s.name, signedAt, signedIp: s.ip, signedUa: s.ua, signaturePng: s.signaturePng, companySigner: c.company_signer,
    companySignedAt: new Date(c.company_signed_at), sentAt: new Date(c.sent_at), viewedAt: c.viewed_at ? new Date(c.viewed_at) : null, viewedIp: c.viewed_ip, docSha256: docSha,
  });
  const buf = Buffer.from(pdf);
  // Claim the signature atomically so a double click can't sign twice.
  const done = await q<{ id: number }[]>`
    update contracts set status = 'signed', signed_at = ${signedAt}, signer_phone = ${s.phone}, signer_address = ${s.address}, signed_name = ${s.name}, signed_ip = ${s.ip}, signed_ua = ${s.ua.slice(0, 300)},
      signature_png = ${s.signaturePng}, consent = true, pdf = ${buf}, pdf_sha256 = ${sha(pdf)}
    where id = ${c.id} and status in ('sent','viewed') returning id`;
  if (!done.length) return { error: "This contract is already signed." };
  // Link to the staff profile if this person has a portal account.
  const uid = c.user_id ?? (await q<{ id: number }[]>`select id from users where lower(email) = ${c.signer_email}`)[0]?.id ?? null;
  if (uid) await q`update staff_profiles set contract_version = ${c.doc_version}, contract_signature = ${s.name}, contract_signed_at = ${signedAt}, contract_ip = ${s.ip} where user_id = ${uid}`;
  await audit(uid, "contract_signed", `MS-C${c.id} by ${c.signer_email}`);

  const filename = `MacroSnaps-Contractor-Agreement-${c.signer_name.replace(/[^\w]+/g, "-")}-MS-C${c.id}.pdf`;
  const args = [c.doc_title, c.doc_version, `MS-C${c.id}`, c.signer_email, c.company_signer] as const;
  const toSigner = contractSignedSigner(s.name, args[0], args[1], args[2], args[3], args[4]);
  await sendMail({ to: c.signer_email, subject: toSigner.subject, html: toSigner.html, attachments: [{ filename, content: buf }] });
  const toTeam = contractSignedTeam(s.name, args[0], args[1], args[2], args[3], args[4]);
  await sendMail({ to: SITE.email, replyTo: c.signer_email, subject: toTeam.subject, html: toTeam.html, attachments: [{ filename, content: buf }] });
  await notifyAdmins(`${c.signer_name} signed the contractor agreement`, `MS-C${c.id}`, "/admin/contracts").catch(() => null);
  return { ok: true as const, id: c.id };
}

async function getContract(token: string) {
  if (!token || token.length > 100) return null;
  return (await q<ContractRow[]>`select id, user_id, inquiry_id, signer_name, signer_email, doc_title, doc_version, doc_sections, company_signer, company_signed_at, status, sent_at,
    viewed_at, viewed_ip, signed_at, signed_name, signed_ip, signed_ua, signature_png, pdf_sha256, doc_sha256 from contracts where token_hash = ${sha(token)}`)[0] ?? null;
}
export { getContract };

export async function contractPdf(where: { id?: number; token?: string }) {
  const rows = where.id
    ? await q<{ pdf: Buffer | null; signer_name: string; id: number }[]>`select pdf, signer_name, id from contracts where id = ${where.id}`
    : await q<{ pdf: Buffer | null; signer_name: string; id: number }[]>`select pdf, signer_name, id from contracts where token_hash = ${sha(where.token ?? "")} and status = 'signed'`;
  return rows[0] ?? null;
}

export async function listContracts() {
  return q<(Omit<ContractRow, "doc_sections" | "signature_png"> & { has_pdf: boolean })[]>`
    select id, user_id, inquiry_id, signer_name, signer_email, doc_title, doc_version, company_signer, company_signed_at, status, sent_at, viewed_at, viewed_ip,
      signed_at, signed_name, signed_ip, signed_ua, pdf_sha256, doc_sha256, pdf is not null as has_pdf
    from contracts order by sent_at desc limit 500`;
}
