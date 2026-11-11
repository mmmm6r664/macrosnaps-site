import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Empty } from "@/components/admin/ui";

export const metadata = { title: "Knowledge base", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Paragraph text with web addresses turned into links. */
function Para({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return <p className="whitespace-pre-wrap">{parts.map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all underline">{p}</a> : p))}</p>;
}

const ORDER = ["Before the Shoot", "During the Shoot", "After the Shoot"];

export default async function Knowledge() {
  const u = await requireStaff();
  // Photographers and videographers only.
  if (u.role !== "staff") notFound();
  const rows = await q<{ id: number; title: string; body: string; category: string }[]>`select id, title, body, category from kb_articles where published order by category, sort, title`;
  const cats = [...new Set(rows.map((r) => r.category))].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
  return (
    <>
      <PageHead title="Knowledge base" sub="MacroSnaps' operating standards for photography and videography contractors, from preparing for an assignment through file delivery. Confidential: for your MacroSnaps assignments only." />
      {rows.length ? cats.map((c) => (
        <section key={c} className="mb-6"><h2 className="mb-2 font-serif text-2xl">{c}</h2>
          {rows.filter((r) => r.category === c).map((a) => (
            <details key={a.id} className="mb-2 rounded-lg border border-black/10 bg-white p-4"><summary className="cursor-pointer font-semibold">{a.title}</summary>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-black/80">{a.body.split(/\n{2,}/).map((p, i) => <Para key={i} text={p} />)}</div>
            </details>
          ))}
        </section>
      )) : <Empty>Guides will appear here soon.</Empty>}
    </>
  );
}
