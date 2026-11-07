"use client";
import { useActionState } from "react";
import { requestLink, type LinkState } from "@/app/(site)/account/actions";

export default function LoginForm({ next, google, facebook, error }: { next: string; google: boolean; facebook: boolean; error?: string }) {
  const [state, act, busy] = useActionState<LinkState, FormData>(requestLink, {});
  if (state.ok)
    return (
      <div className="border border-gold/60 bg-gold/10 p-6 text-center">
        <p className="font-serif text-2xl">Check your email</p>
        <p className="mt-2 text-muted">If that address is valid, we just sent you a sign-in link. It works once and expires in 20 minutes. Check your spam folder if you don&apos;t see it.</p>
      </div>
    );
  return (
    <div className="space-y-5">
      {(google || facebook) && (
        <div className="space-y-3">
          {google && (
            <a href={`/api/client/oauth/google?next=${encodeURIComponent(next)}`} className="flex w-full items-center justify-center gap-3 border border-black/15 bg-white px-4 py-3 font-semibold hover:bg-black/5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.7-4.9h-4v3.1A12 12 0 0 0 12 24z" /><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" /><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c1-2.8 3.6-4.9 6.7-4.9z" /></svg>
              Continue with Google
            </a>
          )}
          {facebook && (
            <a href={`/api/client/oauth/facebook?next=${encodeURIComponent(next)}`} className="flex w-full items-center justify-center gap-3 bg-[#1877F2] px-4 py-3 font-semibold text-white hover:bg-[#166fe5]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" /></svg>
              Continue with Facebook
            </a>
          )}
          <p className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></p>
        </div>
      )}
      <form action={act} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label htmlFor="email" className="block text-sm font-semibold">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="The email you booked with" className="w-full border border-black/15 bg-white px-4 py-3" />
        {(state.error || error) && <p className="text-sm text-red-700">{state.error || error}</p>}
        <button disabled={busy} className="btn-gold w-full disabled:opacity-60">{busy ? "Sending…" : "Email me a sign-in link"}</button>
      </form>
      <p className="text-xs text-muted">No password needed. Use the email address you booked with to see all your orders.</p>
    </div>
  );
}
