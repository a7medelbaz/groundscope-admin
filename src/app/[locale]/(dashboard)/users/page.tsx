"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CredentialsDialog } from "@/components/dialogs/credentials-dialog";
import { UserForm, type UserFormData } from "@/components/forms/user-form";
import { getUsersColumns } from "@/components/tables/users-columns";
import { getUsers, updateUser, deleteUser, createUserViaBrowser } from "@/lib/queries/users";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types/database";

export default function UsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("users_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleCreateClick = () => {
    setEditingUser(null);
    setSheetOpen(true);
  };

  const handleEditClick = (row: User) => {
    setEditingUser(row);
    setSheetOpen(true);
  };

  const handleDeleteClick = (row: User) => {
    setDeleteTarget(row);
  };

  const handleSubmitForm = async (data: UserFormData & { email?: string; password?: string }) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
      } else {
        const result = await createUserViaBrowser(
          data.email!,
          data.password!,
          data.full_name,
          data.role,
          data.service_type_id,
          data.unit_id
        );

        if (!result.success) {
          console.error("Failed to create user:", result.error);
          return;
        }

        setShowCredentials({ email: data.email!, password: data.password! });
      }

      setSheetOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getUsersColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Users"
          description="Manage admin, supervisors, and unit managers"
          icon={Users}
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

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm text-text-secondary">
              {users.length} user{users.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={users} getRowKey={(row) => row.id} />
          </CardBody>
        </Card>
      </motion.div>

      {/* Create/Edit Sheet */}
      <SlideOverSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingUser ? "Edit User" : "Create User"}
        description={editingUser ? "Update user details" : "Add a new admin, supervisor, or manager"}
      >
        <UserForm
          initialData={editingUser || undefined}
          onSubmit={handleSubmitForm}
          isLoading={isLoading}
        />
      </SlideOverSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User?"
        description={`Are you sure you want to delete ${deleteTarget?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Credentials Dialog */}
      {showCredentials && (
        <CredentialsDialog
          open={true}
          onOpenChange={(open) => !open && setShowCredentials(null)}
          email={showCredentials.email}
          password={showCredentials.password}
        />
      )}
    </>
  );
}
