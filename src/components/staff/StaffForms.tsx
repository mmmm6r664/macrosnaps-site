"use client";
import { useActionState, useState } from "react";
import { saveProfile, saveW9, signContract, openTicket, type S } from "@/app/staff/(portal)/actions";
import { noReset } from "@/components/admin/noReset";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

const Msg = ({ s }: { s: S }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

type P = { phone: string; city: string; radius: number; roles: string[]; shoots: string[]; gear: string; bio: string; portfolio: string; payout_method: string; payout_handle: string };
export function ProfileForm({ p, shootTypes }: { p: P; shootTypes: string[] }) {
  const [s, act, pending] = useActionState<S, FormData>(saveProfile, undefined);
  const [method, setMethod] = useState(p.payout_method);
  const hint: Record<string, string> = { Venmo: "@username", PayPal: "PayPal email", "Cash App": "$cashtag", Zelle: "Zelle email or phone" };
  return (
    <form onSubmit={noReset(act)} className="space-y-6">
      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black/60">Your details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={labelCls} htmlFor="phone">Mobile phone (for shoot texts)</label><input id="phone" name="phone" defaultValue={p.phone} className={inputCls} /></div>
          <div><label className={labelCls} htmlFor="city">Home base: city, state</label><input id="city" name="city" defaultValue={p.city} placeholder="Arlington, VA" className={inputCls} /></div>
          <div><label className={labelCls} htmlFor="radius">How far will you travel? (miles)</label><input id="radius" name="radius" type="number" min={5} max={500} defaultValue={p.radius} className={inputCls} /></div>
          <div><label className={labelCls} htmlFor="portfolio">Portfolio / Instagram link</label><input id="portfolio" name="portfolio" defaultValue={p.portfolio} className={inputCls} /></div>
        </div>
        <fieldset className="mt-4"><legend className={labelCls}>I shoot</legend><div className="flex gap-4 text-sm">{["Photographer", "Videographer"].map((r) => <label key={r} className="flex items-center gap-2"><input type="checkbox" name="roles" value={r} defaultChecked={p.roles.includes(r)} />{r === "Photographer" ? "Photography" : "Videography"}</label>)}</div></fieldset>
        <fieldset className="mt-4"><legend className={labelCls}>Shoots I want to be offered</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{shootTypes.map((x) => <label key={x} className="flex items-center gap-2 rounded border border-black/10 px-3 py-2 text-sm"><input type="checkbox" name="shoots" value={x} defaultChecked={p.shoots.includes(x)} />{x}</label>)}</div>
        </fieldset>
        <div className="mt-4"><label className={labelCls} htmlFor="gear">Gear (cameras, lenses, lighting, audio)</label><textarea id="gear" name="gear" rows={4} defaultValue={p.gear} className={inputCls} /></div>
        <div className="mt-4"><label className={labelCls} htmlFor="bio">Short bio</label><textarea id="bio" name="bio" rows={3} defaultValue={p.bio} className={inputCls} /></div>
      </section>
      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black/60">How you get paid</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={labelCls} htmlFor="pm">Payout method</label><select id="pm" name="payout_method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}><option value="">Choose…</option>{["Venmo", "PayPal", "Cash App", "Zelle"].map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><label className={labelCls} htmlFor="ph">{method ? `${method} account` : "Account"}</label><input id="ph" name="payout_handle" defaultValue={p.payout_handle} placeholder={hint[method] ?? ""} className={inputCls} /></div>
        </div>
      </section>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}

export function W9Form({ d, onFile }: { d: { legal: string; business: string; cls: string; address: string; tinType: string }; onFile: string | null }) {
  const [s, act, pending] = useActionState<S, FormData>(saveW9, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4 rounded-lg border border-black/10 bg-white p-5">
      {onFile && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-900">On file: {onFile}. Submit again only to update it.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={labelCls} htmlFor="ln">Legal name (as shown on your tax return)</label><input id="ln" name="legal_name" defaultValue={d.legal} required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="bn">Business name, if different</label><input id="bn" name="business_name" defaultValue={d.business} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="cl">Federal tax classification</label>
          <select id="cl" name="classification" defaultValue={d.cls} required className={inputCls}><option value="">Choose…</option>{["Individual / sole proprietor / single-member LLC", "C corporation", "S corporation", "Partnership", "LLC taxed as C corporation", "LLC taxed as S corporation", "LLC taxed as partnership", "Other"].map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <div><label className={labelCls} htmlFor="tt">ID type</label><select id="tt" name="tin_type" defaultValue={d.tinType || "ssn"} className={inputCls}><option value="ssn">SSN</option><option value="ein">EIN</option></select></div>
          <div><label className={labelCls} htmlFor="tin">SSN or EIN</label><input id="tin" name="tin" inputMode="numeric" autoComplete="off" placeholder="9 digits" required className={inputCls} /></div>
        </div>
      </div>
      <div><label className={labelCls} htmlFor="ad">Address (street, city, state, ZIP)</label><textarea id="ad" name="address" rows={2} defaultValue={d.address} required className={inputCls} /></div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="certify" className="mt-1" /><span>Under penalties of perjury, I certify that the number shown is my correct taxpayer identification number, that I am not subject to backup withholding (or have not been notified that I am), and that I am a U.S. citizen or other U.S. person.</span></label>
      <div><label className={labelCls} htmlFor="sg">Type your full name to sign</label><input id="sg" name="signature" required className={`${inputCls} font-script text-2xl`} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Submit W-9"}</button>
      <p className="text-xs text-black/50">Your SSN/EIN is encrypted before it&apos;s saved. MacroSnaps staff only see the last 4 digits; the full number is used only to file your 1099.</p>
    </form>
  );
}

export function ContractForm() {
  const [s, act, pending] = useActionState<S, FormData>(signContract, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3 rounded-lg border border-black/10 bg-[#faf8f3] p-5">
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="agree" className="mt-1" />I have read and agree to the MacroSnaps Independent Contractor Agreement.</label>
      <div><label className={labelCls} htmlFor="sig">Type your full name to sign</label><input id="sig" name="signature" required className={`${inputCls} font-script text-2xl`} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Signing…" : "Sign agreement"}</button>
    </form>
  );
}

export function TicketForm({ categories = [] }: { categories?: string[] }) {
  const [s, act, pending] = useActionState<S, FormData>(openTicket, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3 rounded-lg border border-black/10 bg-white p-5">
      <div><label className={labelCls} htmlFor="cat">Topic</label><select id="cat" name="category" className={inputCls}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className={labelCls} htmlFor="ord">Order number (optional)</label><input id="ord" name="order" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="sub">Subject</label><input id="sub" name="subject" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="bd">How can we help?</label><textarea id="bd" name="body" rows={5} required className={inputCls} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Sending…" : "Send request"}</button>
    </form>
  );
}
