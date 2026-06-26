"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus, CircleParking } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StandForm, type StandFormData } from "@/components/forms/stand-form";
import { getStandsColumns } from "@/components/tables/stands-columns";
import { getStands, createStand, updateStand, deleteStand } from "@/lib/queries/stands";
import { createClient } from "@/lib/supabase/client";
import type { Stand } from "@/lib/types/database";

export default function StandsPage() {
  const t = useTranslations();
  const supabase = createClient();

  const [stands, setStands] = useState<Stand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStands();
  }, []);

  const loadStands = async () => {
    setIsLoading(true);
    try {
      const data = await getStands();
      setStands(data);
    } catch (error) {
      console.error("Failed to load stands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("stands_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "stands" }, () => {
        loadStands();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleCreateClick = () => {
    setEditingStand(null);
    setSheetOpen(true);
  };

  const handleEditClick = (row: Stand) => {
    setEditingStand(row);
    setSheetOpen(true);
  };

  const handleDeleteClick = (row: Stand) => {
    setDeleteTarget(row);
  };

  const handleSubmitForm = async (data: StandFormData) => {
    setIsLoading(true);
    try {
      if (editingStand) {
        await updateStand(editingStand.id, data);
      } else {
        await createStand(data);
      }
      setSheetOpen(false);
      loadStands();
    } catch (error) {
      console.error("Failed to save stand:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStand(deleteTarget.id);
      setDeleteTarget(null);
      loadStands();
    } catch (error) {
      console.error("Failed to delete stand:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getStandsColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t("nav.stands")}
          description="Manage airport parking stands"
          icon={CircleParking}
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

      {/* Stands Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm text-text-secondary">
              {stands.length} stand{stands.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={stands} getRowKey={(row) => row.id} />
          </CardBody>
        </Card>
      </motion.div>

      {/* Create/Edit Sheet */}
      <SlideOverSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingStand ? "Edit Stand" : "Create Stand"}
        description={editingStand ? "Update stand details" : "Add a new airport stand"}
      >
        <StandForm
          initialData={editingStand || undefined}
          onSubmit={handleSubmitForm}
          isLoading={isLoading}
        />
      </SlideOverSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Stand?"
        description={`Are you sure you want to delete stand "${deleteTarget?.code}"? This action cannot be undone.`}
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
