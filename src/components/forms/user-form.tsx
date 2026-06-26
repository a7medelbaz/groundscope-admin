"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateCredentials } from "@/lib/utils/credentials";
import { getServiceTypes } from "@/lib/queries/service-types";
import { getUnits } from "@/lib/queries/units";
import type { ServiceType, Unit, User } from "@/lib/types/database";

const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  role: z.enum(["supervisor", "unit_manager"]),
  service_type_id: z.string().optional(),
  unit_id: z.string().optional(),
  phone: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData & { email?: string; password?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    Promise.all([getServiceTypes(), getUnits()])
      .then(([sts, us]) => {
        setServiceTypes(sts);
        setUnits(us);
      })
      .catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      role: (initialData?.role as "supervisor" | "unit_manager") || "supervisor",
      service_type_id: initialData?.service_type_id || "",
      unit_id: initialData?.unit_id || "",
      phone: initialData?.phone || "",
    },
  });

  const role = watch("role");
  const serviceTypeId = watch("service_type_id");
  const unitId = watch("unit_id");

  const handleFormSubmit = async (data: UserFormData) => {
    if (initialData) {
      await onSubmit(data);
      return;
    }

    const identifier = role === "supervisor" ? serviceTypeId : unitId;
    if (!identifier) {
      alert(`Please select a ${role === "supervisor" ? "service type" : "unit"}`);
      return;
    }

    const lookupValue = role === "supervisor"
      ? serviceTypes.find((st) => st.id === identifier)?.name
      : units.find((u) => u.id === identifier)?.name;

    if (!lookupValue) return;

    const creds = generateCredentials(role, lookupValue);
    setGeneratedCreds(creds);

    await onSubmit({
      ...data,
      email: creds.email,
      password: creds.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          id="name"
          {...register("full_name")}
          placeholder="e.g., Ahmed Hassan"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.full_name && (
          <p className="text-error text-xs mt-1.5 font-medium">{errors.full_name.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-semibold text-text-primary mb-2">
          Role <span className="text-error">*</span>
        </label>
        <select
          id="role"
          {...register("role")}
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading || !!initialData}
        >
          <option value="supervisor">Supervisor (Service Type Manager)</option>
          <option value="unit_manager">Unit Manager (Unit Manager)</option>
        </select>
      </div>

      {/* Service Type or Unit (conditional) */}
      {role === "supervisor" ? (
        <div>
          <label htmlFor="service_type" className="block text-sm font-semibold text-text-primary mb-2">
            Service Type <span className="text-error">*</span>
          </label>
          <select
            id="service_type"
            {...register("service_type_id")}
            className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            <option value="">Select a service type</option>
            {serviceTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="unit" className="block text-sm font-semibold text-text-primary mb-2">
            Unit <span className="text-error">*</span>
          </label>
          <select
            id="unit"
            {...register("unit_id")}
            className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            <option value="">Select a unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
          Phone (Optional)
        </label>
        <input
          id="phone"
          {...register("phone")}
          placeholder="e.g., +20 1234567890"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card mt-8"
      >
        {isLoading ? "Creating..." : initialData ? "Update User" : "Create User"}
      </button>
    </form>
  );
}
