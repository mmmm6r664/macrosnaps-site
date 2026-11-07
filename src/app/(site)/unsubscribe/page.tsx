import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db, hasDb, q } from "@/lib/db";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";
const valid = (t?: string) => !!t && /^[A-Za-z0-9_-]{10,64}$/.test(t);

async function confirm(f: FormData) {
  "use server";
  const t = String(f.get("t") ?? "");
  if (hasDb && valid(t)) await q`update subscribers set status = 'unsubscribed' where token = ${t}`;
  redirect("/unsubscribe?done=1");
}

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ t?: string; done?: string }> }) {
  const { t, done } = await searchParams;
  return (
    <section className="mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="font-serif text-4xl">{done ? "You're unsubscribed" : "Unsubscribe"}</h1>
      {done ? <p className="mt-4 text-muted">You won&apos;t receive MacroSnaps newsletters anymore.</p>
        : valid(t) ? (
          <form action={confirm} className="mt-6">
            <input type="hidden" name="t" value={t} />
            <p className="text-muted">Stop receiving MacroSnaps newsletters?</p>
            <button className="btn-dark mt-6">Unsubscribe</button>
          </form>
        ) : <p className="mt-4 text-muted">This unsubscribe link isn&apos;t valid. Email info@macrosnaps.com and we&apos;ll remove you.</p>}
    </section>
  );
}
