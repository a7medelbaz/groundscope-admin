"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SlideOverSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  side?: "right" | "left";
}

export function SlideOverSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
}: SlideOverSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const isRight = side === "right";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={isRight ? { right: -400, opacity: 0 } : { left: -400, opacity: 0 }}
            animate={isRight ? { right: 0, opacity: 1 } : { left: 0, opacity: 1 }}
            exit={isRight ? { right: -400, opacity: 0 } : { left: -400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 h-full w-full max-w-lg bg-surface border border-divider shadow-overlay z-50 flex flex-col overflow-hidden",
              isRight ? "right-0 border-s" : "left-0 border-e"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-text-primary">{title}</h2>
                {description && (
                  <p className="text-sm text-text-hint mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-control hover:bg-surface-variant text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
