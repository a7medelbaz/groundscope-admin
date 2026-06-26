"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/lib/actions/auth";
import { useState } from "react";

export function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? t("common.loading") : t("common.logout")}
    </button>
  );
}
