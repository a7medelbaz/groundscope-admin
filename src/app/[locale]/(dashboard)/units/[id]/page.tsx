"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getUnitById, updateUnit, createUnit } from "@/lib/queries/units";
import { getUnitMembers } from "@/lib/queries/unit-members";
import type { Unit, UnitMember } from "@/lib/types/database";
import { UnitForm, type UnitFormData } from "@/components/forms/unit-form";
import { UnitMembersSection } from "@/components/sections/unit-members-section";
import { cn } from "@/lib/utils/cn";

type Tab = "info" | "members";

export default function UnitDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const unitId = params.id as string;
  const isNew = unitId === "new";

  const [unit, setUnit] = useState<Unit | null>(null);
  const [members, setMembers] = useState<UnitMember[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
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
      if (isNew) {
        setActiveTab("members");
        router.push(`/${locale}/units/${savedUnit.id}`);
      }
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

      {unit && !isNew && (
        <div className="flex gap-1 mb-6 border-b border-divider">
          {[
            { id: "info" as Tab, label: "Unit Info", icon: Info },
            { id: "members" as Tab, label: "Team Members", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileHover={{ backgroundColor: "var(--color-surface-variant)" }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors",
                activeTab === id
                  ? "border-primary-200 text-primary-200"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={activeTab}
      >
        {(isNew || activeTab === "info") && (
          <Card className="max-w-2xl">
            <CardBody className="p-8">
              <h3 className="text-lg font-extrabold text-text-primary mb-6">
                {isNew ? "Unit Details" : "Edit Unit"}
              </h3>
              <UnitForm
                initialData={unit || undefined}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

        {unit && !isNew && activeTab === "members" && (
          <UnitMembersSection unit={unit} members={members} onMembersUpdate={handleMembersUpdate} />
        )}
      </motion.div>
    </>
  );
}
