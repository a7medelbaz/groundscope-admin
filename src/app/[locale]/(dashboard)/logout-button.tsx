"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
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
      className="w-full flex items-center gap-3 px-3 py-2.5 text-error font-medium rounded-control transition-colors hover:bg-error/10 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
      <span className="text-sm">
        {isLoading ? t("common.loading") : t("common.logout")}
      </span>
    </button>
  );
}
