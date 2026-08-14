"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChangePasswordForm } from "./change-password-form";
import { EditProfileForm } from "./edit-profile-form";

/**
 * Account settings: the profile on one tab, the password on the other.
 *
 * The Vue version hand-rolled the tabs from anchors and an `activeTab` ref,
 * which left them unreachable by keyboard; the primitive here handles roving
 * focus and the aria wiring.
 */
export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Data akun Anda dan keamanan masuk." />

      <Card>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList variant="line" className="mb-6">
              <TabsTrigger value="profile">Edit Profil</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <EditProfileForm />
            </TabsContent>
            <TabsContent value="security">
              <ChangePasswordForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
