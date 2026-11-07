import { requireStaff } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Empty } from "@/components/admin/ui";

export const metadata = { title: "Knowledge base" };

export default async function Knowledge() {
  await requireStaff();
  const rows = await q<{ id: number; title: string; body: string; category: string }[]>`select id, title, body, category from kb_articles where published order by category, sort, title`;
  const cats = [...new Set(rows.map((r) => r.category))];
  return (
    <>
      <PageHead title="Knowledge base" sub="How we work: shoot-day checklists, delivery specs, payments and more." />
      {rows.length ? cats.map((c) => (
        <section key={c} className="mb-6"><h2 className="mb-2 font-serif text-2xl">{c}</h2>
          {rows.filter((r) => r.category === c).map((a) => (
            <details key={a.id} className="mb-2 rounded-lg border border-black/10 bg-white p-4"><summary className="cursor-pointer font-semibold">{a.title}</summary>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-black/80">{a.body.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-wrap">{p}</p>)}</div>
            </details>
          ))}
        </section>
      )) : <Empty>Guides will appear here soon.</Empty>}
    </>
  );
}
