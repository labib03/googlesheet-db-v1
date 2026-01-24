import React from "react";
import { getGlobalConfig, saveGlobalConfig } from "@/app/actions";
import { CONFIG_KEYS } from "@/lib/constants";
import { AdminAuthGate } from "@/components/admin-auth-gate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await getGlobalConfig();
  let password = "";

  if (result.success && result.data) {
    password = result.data[CONFIG_KEYS.ADMIN_PASSWORD];
  }

  if (!password) {
    // Init default password if missing in sheet
    password = "admin";
    // We fire and forget the save to avoid blocking render too long, 
    // or await it to ensure consistency. Awaiting is safer for "first run".
    await saveGlobalConfig(CONFIG_KEYS.ADMIN_PASSWORD, password);
  }

  return (
    <AdminAuthGate correctPassword={String(password)}>
      {children}
    </AdminAuthGate>
  );
}
