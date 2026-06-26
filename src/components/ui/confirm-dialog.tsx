"use client";

import React from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-lg max-w-sm w-full">
        <div className="px-6 py-4 border-b border-divider">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-text-secondary text-sm">{description}</p>
        </div>

        <div className="px-6 py-4 border-t border-divider flex justify-end gap-3">
          <Button
            variant="outlined"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "filled"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
