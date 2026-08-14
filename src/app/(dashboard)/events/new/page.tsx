import type { Metadata } from "next";

import { FormPage } from "@/components/shared/form-page";
import { ROUTES } from "@/config/routes";
import { EventForm } from "@/features/event/components/event-form";

export const metadata: Metadata = { title: "Tambah Event" };

export default function Page() {
  return (
    <FormPage
      backHref={ROUTES.events}
      description="Event diskon memotong harga tiap produk; event bundle memberi produk hadiah ketika produk syarat dibeli."
    >
      <EventForm />
    </FormPage>
  );
}
