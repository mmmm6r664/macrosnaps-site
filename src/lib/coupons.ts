// Discount coupons, stored in Stripe (coupon + customer-facing promotion code) so the discount is applied and
// reported by Stripe at checkout. Links like /book?coupon=CODE pre-apply a code.
import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export type CouponRow = {
  id: string; code: string; active: boolean; percentOff: number | null; amountOff: number | null; name: string;
  expiresAt: number | null; maxRedemptions: number | null; timesRedeemed: number; firstTimeOnly: boolean; minAmount: number | null; created: number;
};

const norm = (c: string) => c.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
const row = (p: Stripe.PromotionCode): CouponRow => ({
  id: p.id, code: p.code, active: p.active && p.coupon.valid, percentOff: p.coupon.percent_off, amountOff: p.coupon.amount_off, name: p.coupon.name ?? "",
  expiresAt: p.expires_at, maxRedemptions: p.max_redemptions, timesRedeemed: p.times_redeemed, firstTimeOnly: !!p.restrictions?.first_time_transaction,
  minAmount: p.restrictions?.minimum_amount ?? null, created: p.created,
});

export const describe = (c: Pick<CouponRow, "percentOff" | "amountOff">) => (c.percentOff ? `${c.percentOff}% off` : c.amountOff ? `$${(c.amountOff / 100).toFixed(0)} off` : "Discount");

export async function listCoupons(): Promise<CouponRow[]> {
  if (!stripe) return [];
  const r = await stripe.promotionCodes.list({ limit: 100 });
  return r.data.map(row).sort((a, b) => b.created - a.created);
}

export async function createCoupon(o: { code: string; name?: string; percentOff?: number; amountOffDollars?: number; expiresAt?: Date | null; maxRedemptions?: number | null; firstTimeOnly?: boolean; minAmountDollars?: number | null }) {
  if (!stripe) throw new Error("Stripe isn't connected");
  const code = norm(o.code);
  if (code.length < 3) throw new Error("Code must be at least 3 letters or numbers");
  const pct = Number(o.percentOff) || 0, amt = Number(o.amountOffDollars) || 0;
  if (!(pct > 0 && pct <= 90) && !(amt > 0 && amt <= 5000)) throw new Error("Enter a % off (1–90) or a $ amount off");
  const existing = await stripe.promotionCodes.list({ code, limit: 1 });
  if (existing.data.length) throw new Error(`The code ${code} already exists`);
  const exp = o.expiresAt && !isNaN(+o.expiresAt) ? Math.floor(+o.expiresAt / 1000) : undefined;
  if (exp && exp * 1000 < Date.now()) throw new Error("The expiry date is in the past");
  const coupon = await stripe.coupons.create({
    name: (o.name || code).slice(0, 40), duration: "once",
    ...(pct ? { percent_off: pct } : { amount_off: Math.round(amt * 100), currency: "usd" }),
    ...(exp ? { redeem_by: exp } : {}),
    metadata: { source: "macrosnaps-admin" },
  });
  const min = Number(o.minAmountDollars) || 0;
  const p = await stripe.promotionCodes.create({
    coupon: coupon.id, code,
    ...(exp ? { expires_at: exp } : {}),
    ...(o.maxRedemptions ? { max_redemptions: Math.max(1, Math.floor(o.maxRedemptions)) } : {}),
    ...(o.firstTimeOnly || min ? { restrictions: { ...(o.firstTimeOnly ? { first_time_transaction: true } : {}), ...(min ? { minimum_amount: Math.round(min * 100), minimum_amount_currency: "usd" } : {}) } } : {}),
  });
  return row(p);
}

export async function setCouponActive(id: string, active: boolean) {
  if (!stripe) throw new Error("Stripe isn't connected");
  return row(await stripe.promotionCodes.update(id, { active }));
}

/** An active, unexpired promotion code by its customer-facing code (or null). */
export async function findActiveCode(code: string) {
  if (!stripe) return null;
  const c = norm(code);
  if (!c) return null;
  const r = await stripe.promotionCodes.list({ code: c, active: true, limit: 1 });
  const p = r.data[0];
  if (!p || !p.coupon.valid || (p.expires_at && p.expires_at * 1000 < Date.now()) || (p.max_redemptions && p.times_redeemed >= p.max_redemptions)) return null;
  return row(p);
}
