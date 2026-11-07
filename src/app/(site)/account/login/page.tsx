import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/client/LoginForm";
import { currentClient, oauthEnabled, safeNext } from "@/lib/clientAuth";

export const metadata: Metadata = { title: "Client Sign In", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  expired: "That sign-in link has expired or was already used. Please request a new one.",
  oauth: "We couldn't sign you in with that account. Please try again or use your email.",
  noemail: "Your account didn't share an email address with us. Please sign in with your email instead.",
};

export default async function ClientLogin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await currentClient()) redirect(next);
  return (
    <section className="marble px-4 py-16 md:px-6">
      <div className="mx-auto max-w-md border border-black/10 bg-white p-8 shadow-sm">
        <p className="eyebrow">Client portal</p>
        <h1 className="mt-2 font-serif text-3xl">Sign in to your account</h1>
        <p className="mt-2 text-muted">Track your order, see your gallery when it&apos;s ready, and download your photos.</p>
        <div className="mt-6"><LoginForm next={next} google={oauthEnabled.google} facebook={oauthEnabled.facebook} error={sp.error ? ERRORS[sp.error] : undefined} /></div>
      </div>
    </section>
  );
}
