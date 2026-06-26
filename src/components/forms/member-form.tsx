"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { createUnitMember, updateUnitMember, uploadMemberPhoto } from "@/lib/queries/unit-members";
import type { UnitMember } from "@/lib/types/database";

const memberSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  phone: z.string().optional(),
  national_id: z.string().optional(),
});

export type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  unitId: string;
  initialData?: UnitMember;
  onSuccess: () => void;
}

export function MemberForm({ unitId, initialData, onSuccess }: MemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      position: initialData?.position || "",
      phone: initialData?.phone || "",
      national_id: initialData?.national_id || "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setPhotoPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setSelectedFile(null);
  };

  const handleFormSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    try {
      let imageUrl = initialData?.image_url;

      if (selectedFile) {
        const memberId = initialData?.id || `temp-${Date.now()}`;
        imageUrl = await uploadMemberPhoto(unitId, memberId, selectedFile);
      }

      const payload = { ...data, image_url: imageUrl };

      if (initialData) {
        await updateUnitMember(initialData.id, payload);
      } else {
        await createUnitMember({ unit_id: unitId, ...payload });
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">Photo</label>
        {photoPreview ? (
          <div className="relative w-24 h-24 rounded-control overflow-hidden">
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-1 end-1 p-1 bg-error rounded-full text-white hover:bg-error/90"
            >
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-divider rounded-control cursor-pointer hover:border-primary-200 transition-colors">
            <Upload className="w-5 h-5 text-text-hint" strokeWidth={1.5} />
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isLoading} />
          </label>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="fname" className="block text-sm font-semibold text-text-primary mb-2">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          id="fname"
          {...register("full_name")}
          placeholder="e.g., Ahmed Hassan"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.full_name && <p className="text-error text-xs mt-1.5 font-medium">{errors.full_name.message}</p>}
      </div>

      {/* Position */}
      <div>
        <label htmlFor="position" className="block text-sm font-semibold text-text-primary mb-2">
          Position <span className="text-error">*</span>
        </label>
        <input
          id="position"
          {...register("position")}
          placeholder="e.g., Fuel Technician"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
        {errors.position && <p className="text-error text-xs mt-1.5 font-medium">{errors.position.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
          Phone (Optional)
        </label>
        <input
          id="phone"
          {...register("phone")}
          placeholder="+20 1234567890"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
      </div>

      {/* National ID */}
      <div>
        <label htmlFor="nid" className="block text-sm font-semibold text-text-primary mb-2">
          National ID (Optional)
        </label>
        <input
          id="nid"
          {...register("national_id")}
          placeholder="29912345678901"
          className="w-full px-4 py-2.5 border border-border rounded-control bg-background text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition-colors disabled:opacity-60"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-200 hover:bg-primary-300 active:scale-[0.98] text-white font-bold py-3 rounded-control transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card mt-6"
      >
        {isLoading ? "Saving..." : initialData ? "Update Member" : "Add Member"}
      </button>
    </form>
  );
}
