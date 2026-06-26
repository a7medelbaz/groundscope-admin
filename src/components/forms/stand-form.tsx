"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "@/components/ui/tag-input";
import type { Stand } from "@/lib/types/database";

const standSchema = z.object({
  code: z.string().min(1, "Stand code is required"),
  terminal: z.string().min(1, "Terminal is required"),
  compatible_aircraft: z.array(z.string()).optional(),
  has_camera: z.boolean().optional(),
});

export type StandFormData = z.infer<typeof standSchema>;

interface StandFormProps {
  initialData?: Stand;
  onSubmit: (data: StandFormData) => Promise<void>;
  isLoading?: boolean;
}

export function StandForm({ initialData, onSubmit, isLoading }: StandFormProps) {
  const [aircraftTags, setAircraftTags] = useState<string[]>(
    initialData?.compatible_aircraft || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StandFormData>({
    resolver: zodResolver(standSchema),
    defaultValues: {
      code: initialData?.code || "",
      terminal: initialData?.terminal || "",
      compatible_aircraft: initialData?.compatible_aircraft || [],
      has_camera: initialData?.has_camera || false,
    },
  });

  const handleFormSubmit = async (data: StandFormData) => {
    await onSubmit({ ...data, compatible_aircraft: aircraftTags });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-semibold text-text-primary mb-2">
          Stand Code
        </label>
        <input
          id="code"
          {...register("code")}
          placeholder="e.g., A12, B45"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60 uppercase"
          disabled={isLoading}
        />
        {errors.code && <p className="text-error text-xs mt-1.5 font-medium">{errors.code.message}</p>}
      </div>

      {/* Terminal */}
      <div>
        <label htmlFor="terminal" className="block text-sm font-semibold text-text-primary mb-2">
          Terminal
        </label>
        <input
          id="terminal"
          {...register("terminal")}
          placeholder="e.g., T1, T2A"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.terminal && (
          <p className="text-error text-xs mt-1.5 font-medium">{errors.terminal.message}</p>
        )}
      </div>

      {/* Compatible Aircraft */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Compatible Aircraft Types
        </label>
        <TagInput
          value={aircraftTags}
          onChange={setAircraftTags}
          placeholder="e.g., B787, A380"
          disabled={isLoading}
        />
      </div>

      {/* Has Camera */}
      <div className="flex items-center gap-3 p-3 border border-divider rounded-control bg-surface-variant">
        <input
          id="camera"
          type="checkbox"
          {...register("has_camera")}
          className="w-4 h-4 rounded accent-primary-200"
          disabled={isLoading}
        />
        <label htmlFor="camera" className="text-sm font-semibold text-text-primary cursor-pointer flex-1">
          Camera Installed
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card mt-6"
      >
        {isLoading ? "Saving..." : initialData ? "Update Stand" : "Create Stand"}
      </button>
    </form>
  );
}
