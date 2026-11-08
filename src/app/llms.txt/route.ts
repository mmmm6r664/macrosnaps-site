// llms.txt: a plain-text guide to the site for AI assistants and answer engines.
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { EVENT_TYPES } from "@/data/eventTypes";

export const dynamic = "force-static";

export function GET() {
  const u = (p: string) => `${SITE.url}${p}`;
  const body = `# MacroSnaps

> ${SITE.description}

MacroSnaps (part of MacroHype LLC) provides event, conference, corporate and wedding photography and videography across the United States and in Ontario and Quebec, Canada. Prices are published and clients can book and pay online. Phone ${SITE.phone}, email ${SITE.email}.

## Key pages
- [Book online](${u("/book")}): choose a service, see the price instantly and pay securely
- [Portfolio](${u("/portfolio")}): client galleries by event type
- [Locations](${u("/locations")}): every state, province and city we cover
- [Corporate & conferences](${u("/corporate")})
- [Events](${u("/events")})
- [FAQ](${u("/faq")})
- [About](${u("/about")})
- [Contact](${u("/contact")})
- [Support](${u("/support")})
- [Careers for photographers & videographers](${u("/careers")})
- [Terms & Conditions](${u("/terms")})

## Services
${SERVICES.map((s) => `- [${s.name}](${u(`/${s.slug}`)})`).join("\n")}

## Event types
${EVENT_TYPES.map((e) => `- [${e.name}](${u(`/${e.slug}`)})`).join("\n")}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
