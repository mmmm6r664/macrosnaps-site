import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/AuthForms";
import { db, hasDb, q } from "@/lib/db";

export const metadata = { title: "Set up" };

export default async function Setup() {
  if (!hasDb) redirect("/admin/login");
  const [{ n }] = await q<{ n: number }[]>`select count(*)::int as n from users`;
  if (n > 0) redirect("/admin/login");
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm">
        <p className="font-script text-4xl">MacroSnaps</p>
        <h1 className="mb-2 mt-1 text-sm font-semibold uppercase tracking-[.2em] text-black/50">Create the owner account</h1>
        <p className="mb-6 text-sm text-black/60">This page works once, with the setup code you were given.</p>
        <SetupForm />
      </div>
    </div>
  );
}
