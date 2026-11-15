import Link from "next/link";
/** Optional SMS opt-in shown under phone fields. Unchecked by default; consent is not required to book or apply. */
export default function SmsConsent({ name = "smsConsent", audience = "client", className = "" }: { name?: string; audience?: "client" | "crew"; className?: string }) {
  const what = audience === "crew"
    ? "shoot offers and assignments, schedule updates and file-delivery reminders"
    : "booking confirmations, shoot reminders, schedule updates and delivery notices";
  return (
    <label className={`flex items-start gap-3 text-xs leading-relaxed text-black/65 ${className}`}>
      <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Yes, text me. I agree to receive automated text messages from MacroSnaps (MacroHype LLC) about {what} at the mobile number above.
        Consent is not a condition of purchase. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.
        See our <Link href="/sms" className="underline">SMS Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </span>
    </label>
  );
}
