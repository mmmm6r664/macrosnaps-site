import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VERTICALS } from "@/data/verticals";
import VerticalPage from "@/components/VerticalPage";

const LIST = VERTICALS.filter((v) => v.kind === "solution");
export const dynamicParams = false;
export function generateStaticParams() {
  return LIST.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = LIST.find((x) => x.slug === slug);
  if (!v) return {};
  return { title: { absolute: v.title }, description: v.description, alternates: { canonical: "/solutions/" + v.slug }, openGraph: { title: v.title, description: v.description } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = LIST.find((x) => x.slug === slug);
  if (!v) notFound();
  return <VerticalPage v={v} />;
}
