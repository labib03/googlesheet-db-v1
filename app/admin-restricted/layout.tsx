import React from "react";
import { getGlobalConfig, saveGlobalConfig } from "@/app/actions";
import { CONFIG_KEYS } from "@/lib/constants";
import { AdminAuthGate } from "@/components/admin-auth-gate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await getGlobalConfig();
  let password = "";

  if (result.success && result.data) {
    password = String(result.data[CONFIG_KEYS.ADMIN_PASSWORD] || "");
  }

  if (!password) {
    password = "admin";
    await saveGlobalConfig(CONFIG_KEYS.ADMIN_PASSWORD, password);
  }

  // Init talent mapping if missing
  if (result.success && result.data) {
    if (!result.data[CONFIG_KEYS.MAP_KATEGORI_HOBI]) {
      await saveGlobalConfig(CONFIG_KEYS.MAP_KATEGORI_HOBI, {
        "Olahraga": ["bola", "futsal", "renang", "badminton", "sepeda", "basket", "sepak"],
        "Seni & Kreatif": ["menggambar", "mewarnai", "melukis", "menulis", "musik", "seni"],
        "Edukasi": ["membaca", "baca", "buku", "belajar", "mengaji"],
        "Lifestyle": ["game", "jalan", "traveling", "nonton"]
      });
    }
    if (!result.data[CONFIG_KEYS.MAP_KATEGORI_SKILL]) {
      await saveGlobalConfig(CONFIG_KEYS.MAP_KATEGORI_SKILL, {
        "Kesehatan": ["dokter", "bidan", "perawat"],
        "Pendidikan": ["guru", "dosen"],
        "Wirausaha": ["pengusaha", "bisnis", "dagang"],
        "Keamanan": ["tentara", "polisi", "tni", "polri"],
        "Digital": ["desain", "design", "grafis", "it", "coding", "editing"]
      });
    }
    if (!result.data[CONFIG_KEYS.LIST_KATEGORI_HOBI_ALL]) {
      await saveGlobalConfig(CONFIG_KEYS.LIST_KATEGORI_HOBI_ALL, [
        "Olahraga", "Seni & Kreatif", "Edukasi", "Lifestyle"
      ]);
    }
    if (!result.data[CONFIG_KEYS.LIST_KATEGORI_SKILL_ALL]) {
      await saveGlobalConfig(CONFIG_KEYS.LIST_KATEGORI_SKILL_ALL, [
        "Kesehatan", "Pendidikan", "Wirausaha", "Keamanan", "Digital"
      ]);
    }
  }

  return (
    <AdminAuthGate correctPassword={String(password)}>
      {children}
    </AdminAuthGate>
  );
}
