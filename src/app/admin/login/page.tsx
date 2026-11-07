import Logo from "@/components/Logo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { currentUser } from "@/lib/auth";
import { db, hasDb, q } from "@/lib/db";

export const metadata = { title: "Sign in" };

export default async function Login() {
  if (hasDb && (await currentUser())) redirect("/admin");
  let needsSetup = false;
  if (hasDb) { const [{ n }] = await q<{ n: number }[]>`select count(*)::int as n from users`; needsSetup = n === 0; }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm">
        <Logo size={56} onLight />
        <h1 className="mb-6 mt-1 text-sm font-semibold uppercase tracking-[.2em] text-black/50">Admin sign in</h1>
        {!hasDb ? <p className="text-sm">The database isn&apos;t connected yet. Connect a Neon Postgres database to this project in Vercel.</p>
          : needsSetup ? <p className="text-sm">No accounts yet. <Link href="/admin/setup" className="font-semibold underline">Set up the owner account</Link>.</p>
          : <LoginForm />}
      </div>
    </div>
  );
}
