"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { createCoupon, setCouponActive } from "@/lib/coupons";

export async function addCoupon(f: FormData) {
  const u = await requireUser();
  const g = (k: string) => String(f.get(k) ?? "").trim();
  let msg = "";
  try {
    const kind = g("kind");
    const exp = g("expires");
    const c = await createCoupon({
      code: g("code"), name: g("name"),
      percentOff: kind === "percent" ? Number(g("value")) : undefined, amountOffDollars: kind === "amount" ? Number(g("value")) : undefined,
      expiresAt: exp ? new Date(`${exp}T23:59:59-05:00`) : null, maxRedemptions: Number(g("max")) || null,
      firstTimeOnly: f.get("first") === "on", minAmountDollars: Number(g("min")) || null,
    });
    await audit(u.id, "coupon_create", c.code);
    msg = `ok=${encodeURIComponent(`Created ${c.code}`)}`;
  } catch (e) {
    msg = `err=${encodeURIComponent(e instanceof Error ? e.message : "Couldn't create the coupon")}`;
  }
  revalidatePath("/admin/coupons");
  redirect(`/admin/coupons?${msg}`);
}

export async function toggleCoupon(f: FormData) {
  const u = await requireUser();
  const id = String(f.get("id") ?? "");
  const on = f.get("on") === "1";
  await setCouponActive(id, on);
  await audit(u.id, on ? "coupon_on" : "coupon_off", id);
  revalidatePath("/admin/coupons");
}
