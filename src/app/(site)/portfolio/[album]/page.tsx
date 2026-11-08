import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALBUMS, albumBySlug, CATEGORIES, driveEmbedUrl, driveFolderUrl } from "@/lib/albums";
import { Gallery, CtaBand } from "@/components/blocks";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/blocks";

export const dynamicParams = false;
export function generateStaticParams() {
  return ALBUMS.map((a) => ({ album: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ album: string }> }): Promise<Metadata> {
  const a = albumBySlug((await params).album);
  if (!a) return {};
  const desc = `${a.eventType} photographed by MacroSnaps: ${a.photoCount} photos delivered. ${a.folderId ? "See the highlights and browse the full gallery." : "See a selection of our favorites."}`;
  return { title: `${a.displayTitle}: ${a.eventType} Photography`, description: desc, alternates: { canonical: `/portfolio/${a.slug}` }, openGraph: { images: a.cover ? [a.cover] : undefined } };
}

export default async function AlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const a = albumBySlug((await params).album);
  if (!a) notFound();
  const cat = CATEGORIES[a.category] ?? CATEGORIES.party;
  const more = ALBUMS.filter((x) => x.slug !== a.slug && x.group === a.group).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "ImageGallery", name: a.displayTitle, description: `${a.eventType} photography by MacroSnaps`,
    author: { "@type": "Organization", name: "MacroSnaps", url: SITE.url },
    image: a.photos.map((p) => ({ "@type": "ImageObject", contentUrl: p.src, description: p.alt })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero image={a.cover ?? a.photos[0].src} eyebrow={a.eventType} title={a.displayTitle} subtitle={`${a.photoCount} photos delivered to our client. ${a.folderId ? "Here are a few favorites, and the full gallery below." : "Here are some of our favorites."}`} />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <nav className="mb-6 text-sm text-muted"><Link href="/portfolio" className="hover:text-ink">Portfolio</Link> / <Link href="/portfolio#galleries" className="hover:text-ink">{a.group}</Link></nav>
        <Gallery images={a.photos.map((p) => p.src)} alt={a.displayTitle} />
      </section>
      {a.folderId && (
      <section className="bg-marble px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl">The full gallery</h2>
              <p className="text-sm text-muted">Every photo from this {a.category === "conference" || a.category === "corporate" ? "event" : "celebration"}, as delivered ({a.photoCount} photos).</p>
            </div>
            <a href={driveFolderUrl(a.folderId)} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2.5">Open in Google Drive ↗</a>
          </div>
          <iframe title={`${a.displayTitle}: full gallery`} src={driveEmbedUrl(a.folderId)} loading="lazy" className="h-[75vh] w-full border border-black/10 bg-white" />
        </div>
      </section>
      )}
      {more.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <h2 className="mb-6 font-serif text-3xl">More {a.group.toLowerCase()}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/portfolio/${m.slug}`} className="group block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(m.cover ?? m.photos[0].src).replace(/-2000\.jpg$/, "-800.jpg")} alt={m.displayTitle} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:opacity-90" />
                <p className="mt-2 font-serif text-lg">{m.displayTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <CtaBand title={`Planning a ${a.eventType.toLowerCase()}?`} text={`See our ${cat.serviceName} packages and published prices, or book online in minutes.`} bookHref="/book" />
      <p className="pb-10 text-center text-sm"><Link href={cat.service} className="underline underline-offset-4 hover:text-gold-dark">Learn more about our {cat.serviceName} →</Link></p>
    </>
  );
}
