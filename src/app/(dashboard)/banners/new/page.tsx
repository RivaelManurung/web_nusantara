import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { BannerForm } from "@/features/banner/components/banner-form";

export const metadata: Metadata = { title: "Tambah Banner" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.banners}
      description="Banner tampil di beranda aplikasi. Gunakan gambar yang menarik agar promosi lebih efektif."
    >
      <BannerForm />
    </FormPage>
  );
}
