"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus, Tags } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ServiceTypeForm, type ServiceTypeFormData } from "@/components/forms/service-type-form";
import { getServiceTypeColumns } from "@/components/tables/service-types-columns";
import {
  getServiceTypes,
  createServiceType,
  updateServiceType,
  deleteServiceType,
} from "@/lib/queries/service-types";
import { createClient } from "@/lib/supabase/client";
import type { ServiceType } from "@/lib/types/database";

export default function ServiceTypesPage() {
  const t = useTranslations();
  const supabase = createClient();

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceTypes();
      setServiceTypes(data);
    } catch (error) {
      console.error("Failed to load service types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("service_types_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_types" },
        () => {
          loadServiceTypes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleCreateClick = () => {
    setEditingServiceType(null);
    setSheetOpen(true);
  };

  const handleEditClick = (row: ServiceType) => {
    setEditingServiceType(row);
    setSheetOpen(true);
  };

  const handleDeleteClick = (row: ServiceType) => {
    setDeleteTarget(row);
  };

  const handleSubmitForm = async (data: ServiceTypeFormData) => {
    setIsLoading(true);
    try {
      if (editingServiceType) {
        await updateServiceType(editingServiceType.id, data);
      } else {
        await createServiceType(data);
      }
      setSheetOpen(false);
      loadServiceTypes();
    } catch (error) {
      console.error("Failed to save service type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteServiceType(deleteTarget.id);
      setDeleteTarget(null);
      loadServiceTypes();
    } catch (error) {
      console.error("Failed to delete service type:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getServiceTypeColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t("nav.serviceTypes")}
          description="Manage airport ground service types"
          icon={Tags}
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

      {/* Service Types Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm text-text-secondary">
              {serviceTypes.length} service type{serviceTypes.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={serviceTypes} getRowKey={(row) => row.id} />
          </CardBody>
        </Card>
      </motion.div>

      {/* Create/Edit Sheet */}
      <SlideOverSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingServiceType ? "Edit Service Type" : "Create Service Type"}
        description={editingServiceType ? "Update service type details" : "Add a new ground service type"}
      >
        <ServiceTypeForm
          initialData={editingServiceType || undefined}
          onSubmit={handleSubmitForm}
          isLoading={isLoading}
        />
      </SlideOverSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Service Type?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
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
