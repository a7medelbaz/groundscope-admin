"use client";

import React from "react";
import { motion } from "framer-motion";

type TabType = "delay" | "turnaround" | "performance";

interface AnalyticsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs: Array<{ id: TabType; label: string }>;
}

export function AnalyticsTabs({ activeTab, onTabChange, tabs }: AnalyticsTabsProps) {
  return (
    <div className="flex gap-2 border-b border-divider">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === tab.id
              ? "text-primary-200"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-200"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
