"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Plus, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getUnitsColumns } from "@/components/tables/units-columns";
import { getUnits, deleteUnit } from "@/lib/queries/units";
import { createClient } from "@/lib/supabase/client";
import type { Unit } from "@/lib/types/database";

export default function UnitsPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("units_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "units" }, () => {
        loadUnits();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleCreateClick = () => {
    router.push(`/${locale}/units/new`);
  };

  const handleViewClick = (row: Unit) => {
    router.push(`/${locale}/units/${row.id}`);
  };

  const handleEditClick = (row: Unit) => {
    router.push(`/${locale}/units/${row.id}/edit`);
  };

  const handleDeleteClick = (row: Unit) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUnit(deleteTarget.id);
      setDeleteTarget(null);
      loadUnits();
    } catch (error) {
      console.error("Failed to delete unit:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getUnitsColumns({
    onView: handleViewClick,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Units"
          description="Manage service units and teams"
          icon={Truck}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-primary-200 hover:bg-primary-300 text-white font-bold px-4 py-2.5 rounded-control transition-all shadow-card"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          Create
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm text-text-secondary">
              {units.length} unit{units.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={units} getRowKey={(row) => row.id} />
          </CardBody>
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Unit?"
        description={`Are you sure you want to delete unit "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
