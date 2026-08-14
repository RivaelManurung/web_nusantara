import type { Metadata } from "next";

import { EventPage } from "@/features/event/components/event-page";

export const metadata: Metadata = { title: "Event" };

export default function Page() {
  return <EventPage />;
}
