import { SITE } from "./site";

export const ORG_ID = `${SITE.url}/#organization`;

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.logo,
    description: SITE.description,
    telephone: "+1-877-622-4973",
    email: SITE.email,
    priceRange: "$$",
    parentOrganization: { "@type": "Organization", name: SITE.parent, url: SITE.parentUrl },
    address: SITE.offices.map((o) => ({
      "@type": "PostalAddress",
      streetAddress: o.street,
      addressLocality: o.city,
      addressRegion: o.region,
      postalCode: o.zip,
      addressCountry: o.country,
    })),
    areaServed: [{ "@type": "Country", name: "United States" }, { "@type": "Country", name: "Canada" }],
    sameAs: [...Object.values(SITE.social), ...Object.values(SITE.reviews)],
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE.url}${it.href}` })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function serviceSchema(opts: {
  name: string;
  serviceType: string;
  description: string;
  url: string;
  area?: { type: "City" | "State" | "Country"; name: string; containedIn?: string };
  prices?: number[];
}) {
  const prices = opts.prices?.filter(Boolean) ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: `${SITE.url}${opts.url}`,
    provider: { "@id": ORG_ID },
    areaServed: opts.area
      ? {
          "@type": opts.area.type,
          name: opts.area.name,
          ...(opts.area.containedIn ? { containedInPlace: { "@type": "AdministrativeArea", name: opts.area.containedIn } } : {}),
        }
      : [{ "@type": "Country", name: "United States" }, { "@type": "Country", name: "Canada" }],
    ...(prices.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            url: `${SITE.url}/book`,
          },
        }
      : {}),
  };
}
