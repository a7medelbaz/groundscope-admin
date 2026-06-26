"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getUnitById, updateUnit, createUnit } from "@/lib/queries/units";
import { getUnitMembers } from "@/lib/queries/unit-members";
import type { Unit, UnitMember } from "@/lib/types/database";
import { UnitForm, type UnitFormData } from "@/components/forms/unit-form";
import { UnitMembersSection } from "@/components/sections/unit-members-section";

export default function UnitDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const unitId = params.id as string;
  const isNew = unitId === "new";

  const [unit, setUnit] = useState<Unit | null>(null);
  const [members, setMembers] = useState<UnitMember[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) loadUnit();
  }, [isNew]);

  const loadUnit = async () => {
    setIsLoading(true);
    try {
      const data = await getUnitById(unitId);
      if (!data) {
        router.push(`/${locale}/units`);
        return;
      }
      setUnit(data);
      const membersList = await getUnitMembers(data.id);
      setMembers(membersList);
    } catch (error) {
      console.error("Failed to load unit:", error);
      router.push(`/${locale}/units`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UnitFormData) => {
    setIsLoading(true);
    try {
      const savedUnit = isNew ? await createUnit(data) : await updateUnit(unitId, data);
      setUnit(savedUnit);
      router.push(`/${locale}/units/${savedUnit.id}`);
    } catch (error) {
      console.error("Failed to save unit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMembersUpdate = () => {
    if (unit) {
      getUnitMembers(unit.id).then(setMembers).catch(console.error);
    }
  };

  return (
    <>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary-200 hover:text-primary-300 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      <PageHeader
        title={isNew ? "Create Unit" : unit?.name || "Unit Details"}
        description={isNew ? "Add a new service unit" : "Manage unit information and members"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardBody className="p-6">
              <UnitForm
                initialData={unit || undefined}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* Members */}
        {unit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <UnitMembersSection
              unit={unit}
              members={members}
              onMembersUpdate={handleMembersUpdate}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
