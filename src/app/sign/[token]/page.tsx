import type { Metadata } from "next";
import { getContract, markViewed } from "@/lib/esign";
import { clientIp } from "@/lib/auth";
import SignForm from "@/components/SignForm";
import { LOGO } from "@/lib/emailTemplate";

export const metadata: Metadata = { title: "Sign your agreement · MacroSnaps", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (d: Date | string) => new Date(d).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "long", timeStyle: "short" });

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.slice(0, 100);
  const c = await getContract(token).catch(() => null);
  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen bg-[#f3f0e8] pb-16">
      <header className="bg-black py-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="MacroSnaps" width={130} className="mx-auto h-auto w-[130px]" />
      </header>
      <div className="h-1 bg-[#ccba56]" />
      <div className="mx-auto max-w-3xl px-4 pt-8">{children}</div>
    </main>
  );
  if (!c || c.status === "voided")
    return shell(<div className="bg-white p-8 text-center"><h1 className="font-serif text-3xl">This link isn&apos;t active</h1><p className="mt-3 text-black/70">It may have been replaced by a newer contract. Please check your email for the latest link, or contact MacroSnaps at info@macrosnaps.com.</p></div>);
  if (c.status === "sent") await markViewed(c.id, await clientIp());
  return shell(
    <>
      <p className="text-xs font-bold uppercase tracking-[.25em] text-[#8a7a2b]">Document MS-C{c.id} · Version {c.doc_version}</p>
      <h1 className="mt-2 font-serif text-3xl md:text-4xl">{c.doc_title}</h1>
      <p className="mt-2 text-black/70">Between MacroHype LLC, doing business as MacroSnaps, and <b>{c.signer_name}</b> ({c.signer_email}).</p>
      <ol className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto border border-black/10 bg-white p-5 text-sm leading-relaxed md:p-7">
        {c.doc_sections.filter((s) => !s.title).map((s, i) => <li key={`i${i}`} className="list-none text-black/80">{s.body}</li>)}
        <li className="list-none pt-2 font-bold underline">Terms and Conditions</li>
        {c.doc_sections.filter((s) => s.title).map((s, i) => <li key={i} className="list-none"><p className="text-black/75"><b className="text-black">{i + 1}. {s.title}:</b> {s.body}</p></li>)}
      </ol>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-black/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-widest text-black/50">MacroHype LLC (d/b/a MacroSnaps)</p><p className="mt-2 font-serif text-2xl italic">{c.company_signer}</p><p className="text-xs text-black/50">Signed {fmt(c.company_signed_at)}</p></div>
        <div className="border border-black/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-widest text-black/50">Contractor</p>{c.status === "signed" ? <><p className="mt-2 font-serif text-2xl italic">{c.signed_name}</p><p className="text-xs text-black/50">Signed {fmt(c.signed_at!)}</p></> : <p className="mt-2 text-sm text-black/60">Awaiting your signature</p>}</div>
      </div>
      {c.status === "signed" ? (
        <div className="bg-white p-6 text-center"><p className="font-serif text-2xl">This agreement is signed.</p><a href={`/sign/${token}/pdf`} className="mt-4 inline-block bg-[#ccba56] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black">Download signed PDF</a></div>
      ) : (
        <SignForm token={token} name={c.signer_name} pdfUrl={`/sign/${token}/pdf`} />
      )}
    </>,
  );
}
