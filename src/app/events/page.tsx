import type { Metadata } from "next";
import { EventsIndex } from "@/components/EventTypePage";

export const metadata: Metadata = {
  title: "Event Photography & Videography: Every Celebration",
  description: "Photographers and videographers for Bar Mitzvahs, Indian and Pakistani weddings, quinceañeras, Sweet 16s, galas, award ceremonies and holiday parties. Published prices.",
  alternates: { canonical: "/events" },
};
export default function Page() {
  return <EventsIndex />;
}
