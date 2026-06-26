"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, TaskChecklist } from "@/lib/types/database";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const [checklists, setChecklists] = useState<TaskChecklist[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (task) {
      // Load task checklists - would come from API
      // For now, placeholder
      setChecklists([]);
    }
  }, [task]);

  if (!task) return null;

  const statusMap = {
    pending: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
    in_progress: { color: "text-info", bg: "bg-info/15", border: "border-info/30" },
    paused: { color: "text-error", bg: "bg-error/15", border: "border-error/30" },
    completed: { color: "text-success", bg: "bg-success/15", border: "border-success/30" },
    cancelled: { color: "text-text-secondary", bg: "bg-surface", border: "border-divider" },
  };

  const priorityMap = {
    low: { color: "text-info", bg: "bg-info/15", border: "border-info/30" },
    medium: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
    high: { color: "text-error", bg: "bg-error/15", border: "border-error/30" },
    critical: { color: "text-error", bg: "bg-error/15", border: "border-error/30" },
  };

  const status = statusMap[task.status as keyof typeof statusMap] || statusMap.pending;
  const priority = priorityMap[task.priority as keyof typeof priorityMap] || priorityMap.medium;

  return (
    <SlideOverSheet open={open} onOpenChange={onOpenChange} title="Task Details">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-6"
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-text-hint uppercase tracking-wide mb-2">Status</p>
              <Badge tone={status.color} toneBg={status.bg} toneBorder={status.border}>
                {task.status === "in_progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-hint uppercase tracking-wide mb-2">Priority</p>
              <Badge tone={priority.color} toneBg={priority.bg} toneBorder={priority.border}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Timing Info */}
        <div className="border-t border-divider pt-4">
          <p className="text-xs text-text-hint uppercase tracking-wide mb-3">Scheduled Times</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" strokeWidth={2} />
              <span className="text-sm text-text-secondary">Start:</span>
              <span className="text-sm font-semibold text-text-primary">
                {new Date(task.scheduled_start).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" strokeWidth={2} />
              <span className="text-sm text-text-secondary">End:</span>
              <span className="text-sm font-semibold text-text-primary">
                {new Date(task.scheduled_end).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actual Times */}
        {(task.actual_start || task.actual_end) && (
          <div className="border-t border-divider pt-4">
            <p className="text-xs text-text-hint uppercase tracking-wide mb-3">Actual Times</p>
            <div className="space-y-2">
              {task.actual_start && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-secondary" strokeWidth={2} />
                  <span className="text-sm text-text-secondary">Started:</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {new Date(task.actual_start).toLocaleString()}
                  </span>
                </div>
              )}
              {task.actual_end && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2} />
                  <span className="text-sm text-text-secondary">Completed:</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {new Date(task.actual_end).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="border-t border-divider pt-4">
            <p className="text-xs text-text-hint uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-text-secondary leading-relaxed">{task.notes}</p>
          </div>
        )}

        {/* Checklist */}
        {checklists.length > 0 && (
          <div className="border-t border-divider pt-4">
            <p className="text-xs text-text-hint uppercase tracking-wide mb-3">Checklist</p>
            <div className="space-y-2">
              {checklists.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 p-2 rounded-control hover:bg-surface-variant transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    disabled
                    className="w-4 h-4 rounded accent-success"
                  />
                  <span
                    className={`text-sm flex-1 ${
                      item.is_checked ? "line-through text-text-hint" : "text-text-primary"
                    }`}
                  >
                    {item.item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pause History */}
        <div className="border-t border-divider pt-4">
          <p className="text-xs text-text-hint uppercase tracking-wide mb-3">Status</p>
          <div className="flex items-center gap-2 p-3 bg-surface rounded-control border border-divider">
            {task.status === "paused" ? (
              <>
                <AlertCircle className="w-5 h-5 text-error" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-sm text-error">Task is Paused</p>
                  <p className="text-xs text-text-secondary">Resume to continue</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={2} />
                <p className="font-semibold text-sm text-success">Task is Active</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-divider pt-4 flex gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outlined" className="flex-1">
            Close
          </Button>
        </div>
      </motion.div>
    </SlideOverSheet>
  );
}
