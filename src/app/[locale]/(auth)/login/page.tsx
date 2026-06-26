"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithPassword } from "@/lib/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      const { success, error } = await signInWithPassword(data.email, data.password);

      if (error) {
        setGlobalError(error);
        return;
      }

      if (success) {
        router.push("/");
      }
    } catch (err) {
      console.error("[LoginPage] Unexpected error:", err);
      setGlobalError(t("auth.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {t("app.name")}
          </h1>
          <p className="text-lg text-text-secondary font-semibold">{t("auth.loginTitle")}</p>
          <p className="text-text-hint text-sm mt-2">{t("auth.loginDescription")}</p>
        </div>

        {/* Error Alert */}
        {globalError && (
          <div className="mb-6 p-4 bg-error/15 border border-error rounded-lg">
            <p className="text-error text-sm font-medium">{globalError}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                {t("common.email")}
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@groundscope.com"
                {...register("email")}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                {t("common.password")}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-error text-xs mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-200 hover:bg-primary-300 active:scale-95 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("common.loading") : t("common.login")}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-hint text-xs mt-6">
          {t("auth.adminRequired")}
        </p>
      </div>
    </div>
  );
}
