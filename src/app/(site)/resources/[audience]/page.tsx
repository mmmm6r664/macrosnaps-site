import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AUDIENCES, getAudience } from "@/lib/resources";
import ResourcePage from "@/components/ResourcePage";

export const dynamicParams = true; // unknown slugs still 404 via notFound(); "false" breaks pages after a site-wide revalidate
export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ audience: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const { audience } = await params;
  const a = getAudience(audience);
  if (!a) return {};
  return { title: { absolute: a.title }, description: a.description, alternates: { canonical: `/resources/${a.slug}` }, openGraph: { title: a.title, description: a.description } };
}

export default async function Page({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const a = getAudience(audience);
  if (!a) notFound();
  return <ResourcePage a={a} />;
}
