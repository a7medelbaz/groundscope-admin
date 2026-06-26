"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface FilterPillsProps {
  items: Array<{ id: string | number; label: string }>;
  selected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  className?: string;
}

export function FilterPills({
  items,
  selected,
  onChange,
  className,
}: FilterPillsProps) {
  const togglePill = (id: string | number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <motion.button
            key={item.id}
            onClick={() => togglePill(item.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
              isSelected
                ? "bg-primary-200 text-white"
                : "bg-surface-variant border border-border text-text-secondary hover:border-primary-200/50"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.label}
          </motion.button>
        );
      })}
    </div>
  );
}
