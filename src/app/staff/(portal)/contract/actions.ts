"use server";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { q } from "@/lib/db";
import { sendContract } from "@/lib/esign";

/** Staff member opens the agreement themselves: create a contract (signed by the owner) and go straight to the signing page. */
export async function startSigning() {
  const u = await requireStaff();
  const owner = (await q<{ name: string }[]>`select name from users where role = 'owner' and active order by id limit 1`)[0]?.name ?? "MacroSnaps";
  const c = await sendContract({ name: u.name, email: u.email, userId: u.id, companySigner: owner, by: u.id, email_it: false });
  redirect(new URL(c.url).pathname);
}
