import { NextResponse } from "next/server";
import { CAMERAS, EXPERIENCE, NOT_ELIGIBLE, checkEligibility } from "@/lib/careers";
import { sendMail, table, TEAM_INBOX } from "@/lib/mail";
import { saveInquiry } from "@/lib/records";

const s = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const email = s(b.email);
  const need = [b.name, b.phone, b.city, b.radius, b.role, b.experience, b.status, b.hours, b.portfolio, b.camera, b.lenses];
  if (need.some((v) => !s(v)) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Please complete all required fields" }, { status: 400 });
  // Same eligibility rules as the form, enforced on the server
  if (!checkEligibility({ experience: s(b.experience), camera: s(b.camera), otherYear: s(b.otherYear), otherValue: s(b.otherValue), flags: Array.isArray(b.flags) ? b.flags.map((x: unknown) => s(x, 40)) : [] }))
    return NextResponse.json({ error: NOT_ELIGIBLE }, { status: 422 });

  const cam = CAMERAS.find((c) => c.id === s(b.camera));
  const shoots = Array.isArray(b.shootTypes) ? b.shootTypes.map((x: unknown) => s(x, 60)).join(", ") : "";
  // The voluntary disability answer is deliberately NOT stored with the application.
  const saved = await saveInquiry("application", s(b.name, 120), email, s(b.phone, 40), {
    city: s(b.city), radius: s(b.radius), role: s(b.role), experience: EXPERIENCE.find((x) => x.id === s(b.experience))?.label, workStatus: s(b.status, 80), hours: s(b.hours, 80),
    portfolio: s(b.portfolio, 300), shootTypes: shoots, camera: cam ? `${cam.brand} ${cam.model} (${cam.year})` : `Other: ${s(b.otherModel, 120)} (${s(b.otherYear)}, ${s(b.otherValue)})`,
    secondary: s(b.secondary, 2000), lenses: s(b.lenses, 3000), lighting: s(b.lighting, 3000), notes: s(b.notes, 2000),
  });
  const r = await sendMail({
    to: TEAM_INBOX,
    replyTo: email,
    subject: `Careers application: ${s(b.name, 80)} — ${s(b.role, 40)} — ${s(b.city, 60)}`,
    html: table([
      ["Name", s(b.name)], ["Email", email], ["Phone", s(b.phone, 40)], ["City", s(b.city)], ["Work radius", s(b.radius)], ["Role", s(b.role)],
      ["Experience", EXPERIENCE.find((x) => x.id === s(b.experience))?.label], ["Work status", s(b.status, 80)], ["Working hours", s(b.hours, 80)], ["Portfolio", s(b.portfolio, 300)], ["Shoot types", shoots],
      ["Primary camera", cam ? `${cam.brand} ${cam.model} (${cam.year})` : `Other: ${s(b.otherModel, 120)} (${s(b.otherYear)}, ${s(b.otherValue)})`],
      ["Secondary cameras", s(b.secondary, 2000)], ["Lens kit", s(b.lenses, 3000)], ["Lighting kit", s(b.lighting, 3000)], ["Notes", s(b.notes, 2000)], ["Disability self-ID (voluntary, not used for decisions)", s(b.disability, 80) || "Not answered"],
    ]),
  });
  if (!r.ok && !saved) return NextResponse.json({ error: "We couldn't submit your application right now — please email info@macrosnaps.com" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
