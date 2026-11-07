"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { sign, type SignState } from "@/app/sign/actions";

/** Signature pad (mouse, finger or stylus) + typed legal name + ESIGN consent. */
export default function SignForm({ token, name, pdfUrl }: { token: string; name: string; pdfUrl: string }) {
  const [state, act, busy] = useActionState<SignState, FormData>(sign, undefined);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [png, setPng] = useState("");
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvas.current!;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio; c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio); ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#111";
  }, []);
  const pos = (e: React.PointerEvent) => { const r = canvas.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const down = (e: React.PointerEvent) => { e.preventDefault(); canvas.current!.setPointerCapture(e.pointerId); drawing.current = true; const [x, y] = pos(e); const ctx = canvas.current!.getContext("2d")!; ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const [x, y] = pos(e); const ctx = canvas.current!.getContext("2d")!; ctx.lineTo(x, y); ctx.stroke(); setDrawn(true); };
  const up = () => { if (!drawing.current) return; drawing.current = false; setPng(canvas.current!.toDataURL("image/png")); };
  const clear = () => { const c = canvas.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); setDrawn(false); setPng(""); };

  if (state?.ok)
    return (
      <div className="border-2 border-[#ccba56] bg-[#faf7ee] p-6 text-center">
        <p className="font-serif text-3xl">Signed. Thank you!</p>
        <p className="mt-2 text-black/70">A copy of the signed agreement has been emailed to you and to MacroSnaps.</p>
        <a href={pdfUrl} className="mt-4 inline-block bg-[#ccba56] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black">Download signed PDF</a>
      </div>
    );
  return (
    <form action={act} className="space-y-5 border border-black/10 bg-white p-5 md:p-7">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="signature" value={png} />
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">Your full legal name</label>
        <input id="name" name="name" required defaultValue={name} maxLength={100} autoComplete="name" className="w-full border border-black/20 px-4 py-3 text-base" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="phone" className="mb-1 block text-sm font-semibold">Phone</label><input id="phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" className="w-full border border-black/20 px-4 py-3 text-base" /></div>
        <div><label htmlFor="address" className="mb-1 block text-sm font-semibold">Mailing address</label><input id="address" name="address" required maxLength={200} autoComplete="street-address" placeholder="Street, city, state, ZIP" className="w-full border border-black/20 px-4 py-3 text-base" /></div>
      </div>
      <div>
        <div className="mb-1 flex items-end justify-between"><span className="text-sm font-semibold">Draw your signature</span><button type="button" onClick={clear} className="text-xs underline">Clear</button></div>
        <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} className="h-40 w-full touch-none border-2 border-dashed border-black/25 bg-[#fcfbf7]" aria-label="Signature pad: draw your signature with your mouse or finger" />
        {!drawn && <p className="mt-1 text-xs text-black/50">Use your mouse, finger or stylus.</p>}
      </div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="agree" className="mt-1 h-4 w-4 accent-[#a8963b]" />I have read and agree to the preceding terms and conditions.</label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[#a8963b]" />I agree to sign electronically. My electronic signature is the legal equivalent of my handwritten signature, and I consent to receive this agreement and related records electronically.</label>
      {state?.error && <p className="bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button disabled={busy || !drawn} className="w-full bg-[#ccba56] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black disabled:opacity-50">{busy ? "Signing…" : "Sign agreement"}</button>
    </form>
  );
}
