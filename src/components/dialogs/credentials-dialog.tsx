"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
}

export function CredentialsDialog({
  open,
  onOpenChange,
  email,
  password,
}: CredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(null);

  const handleCopy = (text: string, field: "email" | "password") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-surface border border-divider rounded-card shadow-overlay p-6">
              {/* Icon */}
              <div className="w-12 h-12 rounded-control bg-success/12 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-success" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-lg font-extrabold text-text-primary text-center mb-2">
                Account Created
              </h2>
              <p className="text-text-secondary text-sm text-center mb-6">
                Save these credentials. They will only be shown once.
              </p>

              {/* Credentials */}
              <div className="space-y-3 mb-6">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-background border border-divider rounded-control">
                    <code className="font-mono text-sm text-text-primary flex-1">{email}</code>
                    <button
                      onClick={() => handleCopy(email, "email")}
                      className="p-2 rounded-control hover:bg-surface-variant text-text-secondary hover:text-text-primary transition-colors"
                      type="button"
                    >
                      {copiedField === "email" ? (
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : (
                        <Copy className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-background border border-divider rounded-control">
                    <code className="font-mono text-sm text-text-primary flex-1 tracking-wider">
                      {password}
                    </code>
                    <button
                      onClick={() => handleCopy(password, "password")}
                      className="p-2 rounded-control hover:bg-surface-variant text-text-secondary hover:text-text-primary transition-colors"
                      type="button"
                    >
                      {copiedField === "password" ? (
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : (
                        <Copy className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-2.5 rounded-control transition-all shadow-card"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
