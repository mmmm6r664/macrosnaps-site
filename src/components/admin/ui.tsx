// Small UI kit for the admin portal.
import Link from "next/link";

export const inputCls = "w-full rounded border border-black/15 bg-white px-3 py-2 outline-none focus:border-[#a8963b] focus:ring-2 focus:ring-[#a8963b]/20";
export const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wider text-black/55";
export const btn = "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold transition disabled:opacity-50";
export const btnPrimary = `${btn} bg-[#1d1d1d] text-white hover:bg-black`;
export const btnGold = `${btn} bg-[#ccba56] text-black hover:bg-[#bfae4c]`;
export const btnGhost = `${btn} border border-black/15 bg-white hover:border-black/40`;
export const btnDanger = `${btn} bg-[#b42318] text-white hover:bg-[#912018]`;

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-black/55">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-lg border border-black/10 bg-white p-5 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-black/60">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-800 ring-red-600/20",
  blue: "bg-sky-50 text-sky-800 ring-sky-600/20",
  gray: "bg-black/5 text-black/70 ring-black/10",
};
export const STATUS_TONE: Record<string, keyof typeof TONES> = {
  paid: "green", confirmed: "green", completed: "blue", sent: "green", subscribed: "green", done: "green", succeeded: "green",
  pending_payment: "amber", requested: "amber", new: "amber", scheduled: "blue", draft: "gray", in_progress: "blue", open: "amber", sending: "blue",
  waiting: "amber", resolved: "green", closed: "gray",
  cancelled: "gray", refunded: "red", partially_refunded: "amber", failed: "red", rejected: "gray", unsubscribed: "gray", void: "gray", uncollectible: "red",
};
export function Badge({ status, children }: { status?: string; children?: React.ReactNode }) {
  const tone = TONES[STATUS_TONE[status ?? ""] ?? "gray"];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>{children ?? (status ?? "").replace(/_/g, " ")}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded border border-dashed border-black/15 p-8 text-center text-sm text-black/50">{children}</p>;
}

export function Notice({ tone = "amber", children }: { tone?: "amber" | "green" | "red"; children: React.ReactNode }) {
  const c = tone === "green" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : tone === "red" ? "border-red-300 bg-red-50 text-red-900" : "border-amber-300 bg-amber-50 text-amber-900";
  return <div className={`mb-5 rounded border px-4 py-3 text-sm ${c}`}>{children}</div>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/[.03] text-xs uppercase tracking-wider text-black/55"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-black/5">{children}</tbody>
      </table>
    </div>
  );
}

export function Pager({ base, page, more }: { base: string; page: number; more: boolean }) {
  const sep = base.includes("?") ? "&" : "?";
  return (
    <div className="mt-4 flex justify-end gap-2">
      {page > 1 && <Link className={btnGhost} href={`${base}${sep}page=${page - 1}`}>← Newer</Link>}
      {more && <Link className={btnGhost} href={`${base}${sep}page=${page + 1}`}>Older →</Link>}
    </div>
  );
}

export const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
export const fmtDate = (d: Date | string | null | undefined, time = false) =>
  d ? new Date(d).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : {}) }) : "—";
