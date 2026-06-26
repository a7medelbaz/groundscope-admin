"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "@/components/ui/tag-input";
import { getServiceTypes } from "@/lib/queries/service-types";
import type { Unit, ServiceType } from "@/lib/types/database";

const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  service_type_id: z.string().min(1, "Service type is required"),
  status: z.enum(["available", "busy", "offline"]).optional(),
  compatible_aircraft: z.array(z.string()).optional(),
  shift_start_time: z.string().optional(),
  shift_end_time: z.string().optional(),
});

export type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  initialData?: Unit;
  onSubmit: (data: UnitFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UnitForm({ initialData, onSubmit, isLoading }: UnitFormProps) {
  const [aircraftTags, setAircraftTags] = useState<string[]>(initialData?.compatible_aircraft || []);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    getServiceTypes().then(setServiceTypes).catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: initialData?.name || "",
      service_type_id: initialData?.service_type_id || "",
      status: (initialData?.status as any) || "available",
      compatible_aircraft: initialData?.compatible_aircraft || [],
      shift_start_time: initialData?.shift_start_time || "",
      shift_end_time: initialData?.shift_end_time || "",
    },
  });

  const handleFormSubmit = async (data: UnitFormData) => {
    await onSubmit({ ...data, compatible_aircraft: aircraftTags });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
          Unit Name
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder="e.g., Fuel Truck A1"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.name && <p className="text-error text-xs mt-1.5 font-medium">{errors.name.message}</p>}
      </div>

      {/* Service Type */}
      <div>
        <label htmlFor="service_type" className="block text-sm font-semibold text-text-primary mb-2">
          Service Type
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
        {errors.service_type_id && (
          <p className="text-error text-xs mt-1.5 font-medium">{errors.service_type_id.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-semibold text-text-primary mb-2">
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Compatible Aircraft */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Compatible Aircraft
        </label>
        <TagInput
          value={aircraftTags}
          onChange={setAircraftTags}
          placeholder="e.g., B787, A380"
          disabled={isLoading}
        />
      </div>

      {/* Shift Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="block text-sm font-semibold text-text-primary mb-2">
            Shift Start
          </label>
          <input
            id="start"
            type="time"
            {...register("shift_start_time")}
            className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-semibold text-text-primary mb-2">
            Shift End
          </label>
          <input
            id="end"
            type="time"
            {...register("shift_end_time")}
            className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card mt-6"
      >
        {isLoading ? "Saving..." : initialData ? "Update Unit" : "Create Unit"}
      </button>
    </form>
  );
}
