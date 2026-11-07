import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { q, hasDb } from "@/lib/db";
import { respondToOffer } from "@/lib/offers";

export const metadata: Metadata = { title: "Shoot offer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const valid = (t: string) => /^[A-Za-z0-9_-]{16,40}$/.test(t);

async function respond(f: FormData) {
  "use server";
  const token = String(f.get("token") ?? "");
  if (!valid(token)) redirect("/");
  const r = await respondToOffer({ token }, f.get("answer") === "yes");
  redirect(`/offer/${token}?done=${r.ok ? (f.get("answer") === "yes" ? "accepted" : "declined") : "closed"}`);
}

export default async function Offer({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const { token } = await params;
  const { done } = await searchParams;
  const [o] = hasDb && valid(token) ? await q<{ title: string; city: string | null; shoot_date: string; details: string; pay: string | null; status: string; name: string; response: string }[]>`
    select o.title, o.city, o.shoot_date, o.details, o.pay, o.status, r.name, r.response from offer_recipients r join offers o on o.id = r.offer_id where r.token = ${token}` : [];
  return (
    <section className="mx-auto max-w-xl px-4 py-20">
      {!o ? <h1 className="font-serif text-3xl">This link isn&apos;t valid</h1> : (
        <>
          <p className="eyebrow">Shoot offer</p>
          <h1 className="mt-2 font-serif text-4xl">{o.title}</h1>
          <p className="mt-3 text-lg">{o.shoot_date}{o.city ? ` · ${o.city}` : ""}</p>
          {o.pay && <p className="mt-1">Pay: <b>{o.pay}</b></p>}
          {o.details && <p className="mt-4 whitespace-pre-wrap text-muted">{o.details}</p>}
          {done === "accepted" || (!done && o.response === "accepted") ? <p className="mt-8 rounded bg-emerald-50 p-4 text-emerald-900">Thanks {o.name.split(" ")[0]}, you&apos;ve accepted. We&apos;ll confirm with you shortly. The first confirmed photographer gets the job.</p>
            : done === "declined" ? <p className="mt-8 rounded bg-black/5 p-4">No problem, thanks for letting us know.</p>
            : o.status !== "open" || done === "closed" ? <p className="mt-8 rounded bg-black/5 p-4">This shoot has already been filled. Thanks for your interest!</p>
            : (
              <form action={respond} className="mt-8 flex flex-wrap gap-3">
                <input type="hidden" name="token" value={token} />
                <button name="answer" value="yes" className="btn-gold">I&apos;m available, accept</button>
                <button name="answer" value="no" className="btn-outline">Decline</button>
              </form>
            )}
        </>
      )}
    </section>
  );
}
