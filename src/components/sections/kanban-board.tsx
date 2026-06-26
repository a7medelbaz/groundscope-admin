"use client";

import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatus } from "@/lib/queries/operations";
import type { Task } from "@/lib/types/database";

interface KanbanBoardProps {
  tasks: Task[];
  onTasksUpdate: () => void;
}

const columns = [
  { id: "pending", label: "Pending", icon: AlertCircle, color: "text-warning" },
  { id: "in_progress", label: "In Progress", icon: Clock, color: "text-info" },
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-success" },
];

export function KanbanBoard({ tasks, onTasksUpdate }: KanbanBoardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      onTasksUpdate();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const Icon = column.icon;
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-variant rounded-card p-4 border border-divider min-h-96"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`w-5 h-5 ${column.color}`} strokeWidth={2} />
              <h3 className="font-extrabold text-text-primary">{column.label}</h3>
              <span className="text-xs font-semibold text-text-secondary bg-surface rounded-full px-2 py-0.5">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <Reorder.Group axis="y" values={columnTasks} onReorder={() => {}}>
              <div className="space-y-2">
                {columnTasks.length === 0 ? (
                  <p className="text-text-hint text-sm text-center py-8">No tasks</p>
                ) : (
                  columnTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      onDragEnd={() => {}}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        layoutId={task.id}
                        className="bg-surface border border-divider rounded-control p-3 shadow-sm hover:shadow-raised transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-sm text-text-primary flex-1">{task.id.slice(0, 8)}</p>
                          {column.id !== "completed" && (
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              disabled={isUpdating}
                              className="text-xs px-2 py-1 border border-border rounded-chip bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-200 transition-colors disabled:opacity-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span className="font-medium">{task.service_type_id?.slice(0, 6)}</span>
                          {task.priority && (
                            <Badge
                              tone={
                                task.priority === "critical"
                                  ? "text-error"
                                  : task.priority === "high"
                                    ? "text-warning"
                                    : "text-info"
                              }
                              toneBg={
                                task.priority === "critical"
                                  ? "bg-error/15"
                                  : task.priority === "high"
                                    ? "bg-warning/15"
                                    : "bg-info/15"
                              }
                              toneBorder={
                                task.priority === "critical"
                                  ? "border-error/30"
                                  : task.priority === "high"
                                    ? "border-warning/30"
                                    : "border-info/30"
                              }
                            >
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))
                )}
              </div>
            </Reorder.Group>
          </motion.div>
        );
      })}
    </div>
  );
}
