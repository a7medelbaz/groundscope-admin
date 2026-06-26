"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StatTone = "primary" | "secondary" | "success" | "warning" | "error" | "info";

const toneStyles: Record<
  StatTone,
  { accent: string; iconBg: string; iconText: string }
> = {
  primary: { accent: "before:bg-primary-200", iconBg: "bg-primary-200/12", iconText: "text-primary-200" },
  secondary: { accent: "before:bg-secondary-200", iconBg: "bg-secondary-200/12", iconText: "text-secondary-200" },
  success: { accent: "before:bg-success", iconBg: "bg-success/12", iconText: "text-success" },
  warning: { accent: "before:bg-warning", iconBg: "bg-warning/12", iconText: "text-warning" },
  error: { accent: "before:bg-error", iconBg: "bg-error/12", iconText: "text-error" },
  info: { accent: "before:bg-info", iconBg: "bg-info/12", iconText: "text-info" },
};

interface StatCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
  tone?: StatTone;
  delay?: number;
}

export function StatCard({ value, label, icon: Icon, tone = "primary", delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const styles = toneStyles[tone];

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative overflow-hidden bg-surface border border-border rounded-card shadow-card p-6 transition-shadow duration-200 hover:shadow-raised",
        "before:absolute before:inset-y-0 before:start-0 before:w-1 before:content-['']",
        styles.accent
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-hint mb-2">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-text-primary tabular-nums">
            {displayValue.toLocaleString()}
          </p>
        </div>
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-control flex items-center justify-center",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", styles.iconText)} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
