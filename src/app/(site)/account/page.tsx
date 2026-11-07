import type { Metadata } from "next";
import Link from "next/link";
import { requireClient } from "@/lib/clientAuth";
import { ordersFor } from "@/lib/clientData";
import StageTracker from "@/components/client/StageTracker";
import { signOut, updateProfile } from "./actions";
import { ticketsFor, signedPath, ticketNo, STATUS_LABEL } from "@/lib/tickets";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmtDate = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "Date to be confirmed");

export default async function AccountPage() {
  const c = await requireClient("/account");
  const orders = await ordersFor(c.email);
  const tickets = await ticketsFor({ email: c.email }).catch(() => []);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = orders.filter((o) => (o.first_date ?? "9999") >= today);
  const past = orders.filter((o) => (o.first_date ?? "9999") < today);
  return (
    <section className="marble px-4 py-12 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Client portal</p>
            <h1 className="mt-1 font-serif text-4xl">Hi{c.first_name ? ` ${c.first_name}` : ""}!</h1>
            <p className="mt-1 text-muted">{c.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/book" className="btn-gold !py-2.5">Book a new shoot</Link>
            <Link href="/support" className="btn-dark !py-2.5">Get help</Link>
            <form action={signOut}><button className="btn-dark !py-2.5">Sign out</button></form>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 border border-black/10 bg-white p-8 text-center">
            <p className="font-serif text-2xl">No bookings yet</p>
            <p className="mx-auto mt-2 max-w-lg text-muted">We couldn&apos;t find any bookings for {c.email}. If you booked with a different email address, sign out and sign in with that one, or call us and we&apos;ll help.</p>
          </div>
        ) : (
          <>
            {[["Upcoming & in progress", upcoming], ["Past shoots", past]].map(([title, list]) =>
              (list as typeof orders).length ? (
                <div key={title as string} className="mt-10">
                  <h2 className="mb-4 font-serif text-2xl">{title as string}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(list as typeof orders).map((o) => (
                      <Link key={o.ref} href={`/account/orders/${o.ref}`} className="block border border-black/10 bg-white p-5 transition hover:border-gold hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{o.service_name}</p>
                            <p className="text-sm text-muted">{fmtDate(o.first_date)}{o.city ? ` · ${o.city}` : ""}</p>
                          </div>
                          {o.gallery_ready && <span className="shrink-0 bg-gold px-2 py-1 text-xs font-semibold text-black">Gallery ready</span>}
                          {o.status.includes("refunded") && <span className="shrink-0 bg-black/10 px-2 py-1 text-xs">Refunded</span>}
                        </div>
                        <div className="mt-4"><StageTracker stage={o.stage} compact /></div>
                        <p className="mt-3 text-xs text-muted">Ref {o.ref} · View details →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </>
        )}

        {tickets.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-serif text-2xl">Your support requests</h2>
            <div className="divide-y divide-black/10 border border-black/10 bg-white">
              {tickets.map((t) => (
                <Link key={t.id} href={signedPath(t.id)} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-black/[.02]">
                  <span><b>{t.subject}</b><span className="block text-xs text-muted">{ticketNo(t.id)} · {t.category}</span></span>
                  <span className={`text-sm ${t.status === "resolved" || t.status === "closed" ? "text-emerald-700" : "font-semibold"}`}>{STATUS_LABEL[t.status] ?? t.status} →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <details className="mt-12 border border-black/10 bg-white p-5">
          <summary className="cursor-pointer font-semibold">Your details</summary>
          <form action={updateProfile} className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">First name<input name="firstName" defaultValue={c.first_name} maxLength={60} className="mt-1 w-full border border-black/15 px-3 py-2" /></label>
            <label className="text-sm">Last name<input name="lastName" defaultValue={c.last_name} maxLength={60} className="mt-1 w-full border border-black/15 px-3 py-2" /></label>
            <label className="text-sm">Phone<input name="phone" type="tel" defaultValue={c.phone ?? ""} maxLength={30} className="mt-1 w-full border border-black/15 px-3 py-2" /></label>
            <div className="sm:col-span-3"><button className="btn-dark !py-2">Save</button></div>
          </form>
        </details>
      </div>
    </section>
  );
}
