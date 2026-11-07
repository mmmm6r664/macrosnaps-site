import type { Metadata } from "next";
import { VerticalIndex } from "@/components/VerticalPage";

export const metadata: Metadata = {
  title: "Photo & Video Solutions for Businesses",
  description: "Video ads for Google, Facebook and local TV, social media content, menu photography, testimonial videos and more from MacroSnaps. Published prices.",
  alternates: { canonical: "/solutions" },
};

export default function Page() {
  return <VerticalIndex kind="solution" />;
}
