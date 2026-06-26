"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ServiceType } from "@/lib/types/database";

const serviceTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  default_duration_minutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  icon: z.string().optional(),
});

export type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>;

interface ServiceTypeFormProps {
  initialData?: ServiceType;
  onSubmit: (data: ServiceTypeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ServiceTypeForm({ initialData, onSubmit, isLoading }: ServiceTypeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceTypeFormData>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      default_duration_minutes: initialData.default_duration_minutes,
      icon: initialData.icon || "",
    } : {
      default_duration_minutes: 30,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
          Service Type Name
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder="e.g., Fueling, Catering"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.name && <p className="text-error text-xs mt-1.5 font-medium">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Brief description of this service type"
          rows={3}
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 resize-none"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-error text-xs mt-1.5 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-semibold text-text-primary mb-2">
          Default Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          min="1"
          {...register("default_duration_minutes")}
          placeholder="30"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.default_duration_minutes && (
          <p className="text-error text-xs mt-1.5 font-medium">
            {errors.default_duration_minutes.message}
          </p>
        )}
      </div>

      {/* Icon */}
      <div>
        <label htmlFor="icon" className="block text-sm font-semibold text-text-primary mb-2">
          Icon Name (Optional)
        </label>
        <input
          id="icon"
          {...register("icon")}
          placeholder="e.g., Fuel, Utensils"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.icon && <p className="text-error text-xs mt-1.5 font-medium">{errors.icon.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card mt-6"
      >
        {isLoading ? "Saving..." : initialData ? "Update Service Type" : "Create Service Type"}
      </button>
    </form>
  );
}
