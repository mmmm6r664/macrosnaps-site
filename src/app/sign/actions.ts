"use server";
import { headers } from "next/headers";
import { signContract } from "@/lib/esign";
import { clientIp } from "@/lib/auth";
import { validSignaturePng } from "@/lib/contractPdf";

export type SignState = { ok?: boolean; error?: string } | undefined;

export async function sign(_: SignState, fd: FormData): Promise<SignState> {
  const token = String(fd.get("token") ?? "").slice(0, 100);
  const name = String(fd.get("name") ?? "").replace(/[<>]/g, "").trim().slice(0, 100);
  const phone = String(fd.get("phone") ?? "").replace(/[^\d+()\-\s.]/g, "").trim().slice(0, 30);
  const address = String(fd.get("address") ?? "").replace(/[<>]/g, "").trim().slice(0, 200);
  const sig = String(fd.get("signature") ?? "");
  if (fd.get("consent") !== "on") return { error: "Please agree to sign electronically." };
  if (fd.get("agree") !== "on") return { error: "Please confirm you have read and agree to the agreement." };
  if (name.length < 3 || !/\s/.test(name)) return { error: "Please type your full legal name (first and last)." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Please enter your phone number." };
  if (address.length < 8) return { error: "Please enter your full mailing address." };
  const png = validSignaturePng(sig) ? sig : null;
  if (!png) return { error: "Please draw your signature in the box." };
  const r = await signContract(token, { name, phone, address, signaturePng: png, ip: await clientIp(), ua: (await headers()).get("user-agent") ?? "" });
  return "error" in r ? { error: r.error } : { ok: true };
}
