import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasDb, q } from "@/lib/db";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";
const valid = (t?: string) => !!t && /^[A-Za-z0-9_-]{10,64}$/.test(t);

async function confirm(f: FormData) {
  "use server";
  const t = String(f.get("t") ?? "");
  if (hasDb && valid(t)) await q`update subscribers set status = 'unsubscribed' where token = ${t}`;
  redirect("/unsubscribe?done=1");
}

/** No link code (e.g. a test copy or a forwarded email): unsubscribe by email address instead. */
async function byEmail(f: FormData) {
  "use server";
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  if (hasDb && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Marketing only (newsletters and the welcome series); booking and invoice emails still go out.
    await q`update subscribers set status = 'unsubscribed' where lower(email) = ${email}`;
  }
  redirect("/unsubscribe?done=1");
}

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ t?: string; done?: string }> }) {
  const { t, done } = await searchParams;
  return (
    <section className="mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="font-serif text-4xl">{done ? "You're unsubscribed" : "Unsubscribe"}</h1>
      {done ? <p className="mt-4 text-muted">You won&apos;t receive MacroSnaps newsletters or promotional emails anymore.</p>
        : valid(t) ? (
          <form action={confirm} className="mt-6">
            <input type="hidden" name="t" value={t} />
            <p className="text-muted">Stop receiving MacroSnaps newsletters?</p>
            <button className="btn-dark mt-6">Unsubscribe</button>
          </form>
        ) : (
          <form action={byEmail} className="mx-auto mt-6 max-w-sm">
            <p className="text-muted">Enter your email address and we&apos;ll stop sending you newsletters and promotional emails.</p>
            <input name="email" type="email" required placeholder="you@example.com" className="mt-6 w-full border border-black/20 px-4 py-3 text-center" />
            <button className="btn-dark mt-4 w-full">Unsubscribe</button>
          </form>
        )}
    </section>
  );
}
