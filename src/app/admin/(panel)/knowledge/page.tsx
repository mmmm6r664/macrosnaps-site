import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { saveArticle, deleteArticle } from "./actions";

export const metadata = { title: "Knowledge base" };
type A = { id: number; title: string; body: string; category: string; published: boolean; sort: number };

function ArticleForm({ a }: { a?: A }) {
  return (
    <form action={saveArticle} className="space-y-3">
      {a && <input type="hidden" name="id" value={a.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_90px]">
        <div><label className={labelCls}>Title</label><input name="title" defaultValue={a?.title} required className={inputCls} /></div>
        <div><label className={labelCls}>Category</label><input name="category" defaultValue={a?.category ?? "General"} className={inputCls} placeholder="e.g. Shoot day, Editing, Payments" /></div>
        <div><label className={labelCls}>Order</label><input name="sort" type="number" defaultValue={a?.sort ?? 0} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Article</label><textarea name="body" rows={a ? 6 : 8} defaultValue={a?.body} className={inputCls} placeholder={"Write the guide. Blank line = new paragraph. Links: paste the full https:// address."} /></div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a?.published ?? true} />Visible to staff</label>
        <button className={btnPrimary}>{a ? "Save" : "Add article"}</button>
      </div>
    </form>
  );
}

export default async function Knowledge() {
  await requireUser();
  const rows = await q<A[]>`select id, title, body, category, published, sort from kb_articles order by category, sort, title`;
  return (
    <>
      <PageHead title="Knowledge base" sub="Guides your photographers and videographers see in their staff portal: shoot-day checklist, dress code, delivery specs, payments…" />
      <Card title="New article" className="mb-6"><ArticleForm /></Card>
      <div className="space-y-4">
        {rows.map((a) => (
          <details key={a.id} className="rounded-lg border border-black/10 bg-white p-4">
            <summary className="cursor-pointer font-semibold">{a.category} · {a.title}{!a.published && <span className="ml-2 text-xs font-normal text-black/50">(hidden)</span>}</summary>
            <div className="mt-4"><ArticleForm a={a} /></div>
            <form action={deleteArticle} className="mt-3"><input type="hidden" name="id" value={a.id} /><button className="text-xs text-red-700 underline">Delete article</button></form>
          </details>
        ))}
      </div>
    </>
  );
}
