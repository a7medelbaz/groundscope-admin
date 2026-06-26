"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Kanban } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { KanbanBoard } from "@/components/sections/kanban-board";
import { getTasks } from "@/lib/queries/operations";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/database";

export default function OperationsPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("tasks_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <>
      <PageHeader
        title="Operations Monitor"
        description="Track and manage ground service tasks"
        icon={Kanban}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
          <Card>
            <CardBody className="p-8 text-center">
              <p className="text-text-secondary">Loading tasks...</p>
            </CardBody>
          </Card>
        ) : (
          <KanbanBoard tasks={tasks} onTasksUpdate={loadTasks} />
        )}
      </motion.div>
    </>
  );
}
