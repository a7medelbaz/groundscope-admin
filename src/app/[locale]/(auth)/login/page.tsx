"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle } from "lucide-react";
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
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-32 -end-32 w-96 h-96 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -start-32 w-96 h-96 rounded-full bg-gradient-brand opacity-10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-brand items-center justify-center shadow-raised mb-4">
            <span className="text-white font-extrabold text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">{t("app.name")}</h1>
          <p className="text-base text-text-secondary font-semibold mt-1">
            {t("auth.loginTitle")}
          </p>
          <p className="text-text-hint text-sm mt-1">{t("auth.loginDescription")}</p>
        </div>

        {/* Error Alert */}
        {globalError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-2 p-4 bg-error/10 border border-error/30 rounded-control"
          >
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-error text-sm font-medium">{globalError}</p>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-card p-7 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                {t("common.email")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-hint pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@groundscope.com"
                  {...register("email")}
                  className="w-full ps-10 pe-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                {t("common.password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-hint pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full ps-10 pe-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
            >
              {isLoading ? t("common.loading") : t("common.login")}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-hint text-xs mt-6">
          {t("auth.adminRequired")}
        </p>
      </motion.div>
    </div>
  );
}
