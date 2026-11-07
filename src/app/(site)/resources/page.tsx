import type { Metadata } from "next";
import { ResourcesIndex } from "@/components/ResourcePage";

const title = "Resources for Event Professionals | MacroSnaps";
const description = "Guides for event planners, venues, photographers and wedding officiants: work with MacroSnaps and earn commission as a preferred vendor or referral partner.";

export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: "/resources" }, openGraph: { title, description } };

export default function Page() {
  return <ResourcesIndex />;
}
