"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarContent } from "@/components/layout/sidebar-content";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed top-0 bottom-0 start-0 w-72 max-w-[80vw] bg-surface border-e border-border z-50"
          >
            <SidebarContent onNavigate={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
