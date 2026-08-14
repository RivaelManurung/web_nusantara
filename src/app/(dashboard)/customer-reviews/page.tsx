import type { Metadata } from "next";

import { ReviewPage } from "@/features/review/components/review-page";

export const metadata: Metadata = { title: "Ulasan Pelanggan" };

export default function Page() {
  return <ReviewPage />;
}
