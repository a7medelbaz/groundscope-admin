"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MemberForm } from "@/components/forms/member-form";
import { deleteUnitMember } from "@/lib/queries/unit-members";
import type { Unit, UnitMember } from "@/lib/types/database";

interface UnitMembersSectionProps {
  unit: Unit;
  members: UnitMember[];
  onMembersUpdate: () => void;
}

export function UnitMembersSection({ unit, members, onMembersUpdate }: UnitMembersSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UnitMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnitMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddClick = () => {
    setEditingMember(null);
    setSheetOpen(true);
  };

  const handleEditClick = (member: UnitMember) => {
    setEditingMember(member);
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingMember(null);
  };

  const handleMemberSaved = () => {
    setSheetOpen(false);
    onMembersUpdate();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUnitMember(deleteTarget.id);
      setDeleteTarget(null);
      onMembersUpdate();
    } catch (error) {
      console.error("Failed to delete member:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-text-primary">Team Members</h3>
            <p className="text-sm text-text-secondary mt-1">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-primary-200 hover:bg-primary-300 text-white font-bold px-3 py-2 rounded-control transition-all text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add
          </motion.button>
        </CardHeader>

        <CardBody>
          {members.length === 0 ? (
            <p className="text-text-hint text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 border border-divider rounded-control hover:bg-surface-variant transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-200/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary-200" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{member.full_name}</p>
                    <p className="text-text-secondary text-xs">{member.position}</p>
                    {member.phone && <p className="text-text-hint text-xs mt-0.5">{member.phone}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(member)}
                      className="p-2 rounded-control hover:bg-primary-200/10 text-primary-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(member)}
                      className="p-2 rounded-control hover:bg-error/10 text-error transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <SlideOverSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        title={editingMember ? "Edit Member" : "Add Team Member"}
        description={editingMember ? "Update member details" : "Add a new team member"}
      >
        <MemberForm unitId={unit.id} initialData={editingMember || undefined} onSuccess={handleMemberSaved} />
      </SlideOverSheet>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Member?"
        description={`Are you sure you want to remove ${deleteTarget?.full_name}?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
