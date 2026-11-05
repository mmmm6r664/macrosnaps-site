import type { Metadata } from "next";
import { VerticalIndex } from "@/components/VerticalPage";

export const metadata: Metadata = {
  title: "Photography & Video by Industry",
  description: "Photography and video for dental clinics, medical practices, restaurants, food brands, law firms, hotels, gyms, salons, startups and more. Published prices.",
  alternates: { canonical: "/industries" },
};

export default function Page() {
  return <VerticalIndex kind="industry" />;
}
