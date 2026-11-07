"use client";
import { useActionState, useState } from "react";
import { sendFeedback, type FeedbackState } from "@/app/(site)/account/actions";

export default function FeedbackForm({ refId, initial = 0 }: { refId: string; initial?: number }) {
  const [state, act, busy] = useActionState<FeedbackState, FormData>(sendFeedback, {});
  const [rating, setRating] = useState(initial);
  const [hover, setHover] = useState(0);
  if (state.ok)
    return (
      <div className="text-center">
        <p className="font-serif text-2xl">Thank you for your feedback!</p>
        {state.reviewUrl ? (
          <>
            <p className="mt-2 text-muted">We&apos;re thrilled you loved it. Would you share your experience on Google? It really helps other people find us.</p>
            <a href={state.reviewUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4 inline-flex">Leave a Google review</a>
          </>
        ) : (
          <p className="mt-2 text-muted">Our team reads every response and will be in touch if there&apos;s anything we can do better.</p>
        )}
      </div>
    );
  return (
    <form action={act} className="space-y-4">
      <input type="hidden" name="ref" value={refId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">How did we do?</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}
              className={`text-4xl leading-none transition ${(hover || rating) >= n ? "text-gold" : "text-black/15"}`}>★</button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-semibold">Anything you&apos;d like to tell us? <span className="font-normal text-muted">(optional, only our team sees this)</span></label>
        <textarea id="comment" name="comment" rows={4} maxLength={3000} className="w-full border border-black/15 bg-white px-3 py-2" />
      </div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button disabled={busy || !rating} className="btn-gold disabled:opacity-50">{busy ? "Sending…" : "Send feedback"}</button>
    </form>
  );
}
