import type { Metadata } from "next";

import { BannerPage } from "@/features/banner/components/banner-page";

export const metadata: Metadata = { title: "Banner" };

export default function Page() {
  return <BannerPage />;
}
