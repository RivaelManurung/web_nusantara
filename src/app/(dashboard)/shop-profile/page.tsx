import type { Metadata } from "next";

import { ShopProfilePage } from "@/features/shop-profile/components/shop-profile-page";

export const metadata: Metadata = { title: "Profil Toko" };

export default function Page() {
  return <ShopProfilePage />;
}
