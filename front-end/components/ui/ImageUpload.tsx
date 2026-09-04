/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FiUpload, FiX, FiLoader } from "react-icons/fi";
import { uploadImage } from "@/service/upload";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";

interface ImageUploadProps {
  /** Current image URL (to display if already uploaded) */
  value?: string;
  /** Called when the image URL changes */
  onChange?: (url: string | null) => void;
  /** Alt text for the image */
  alt?: string;
  /** Size variant for styling */
  size?: "sm" | "md" | "lg";
  /** Whether the field is required (shows asterisk) */
  label?: string;
}

const SIZE_CLASSES = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-48 h-48",
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  alt = "Uploaded image",
  size = "md",
  label,
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast(toastTypes.FAILED, "Please select a valid image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(toastTypes.FAILED, "Image must be smaller than 5 MB.");
        return;
      }

      setUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        const res = await uploadImage(file);
        if (res?.data?.success || res?.success) {
          const imageUrl = res?.data?.data?.url;
          setPreview(imageUrl || null);
          onChange?.(imageUrl || null);
          showToast(toastTypes.SUCCESS, "Image uploaded successfully!");
          URL.revokeObjectURL(objectUrl);
        } else {
          console.error("Upload failed:", res?.message || res?.error);
          showToast(
            toastTypes.FAILED,
            res?.message || "Failed to upload image. Please try again."
          );
          setPreview(value || null);
          onChange?.(value || null);
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        showToast(
          toastTypes.FAILED,
          err?.message || "Something went wrong during upload."
        );
        setPreview(value || null);
        onChange?.(value || null);
        URL.revokeObjectURL(objectUrl);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange]
  );

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <span className="text-xs font-semibold text-slate-700">
          {label}{" "}
          <span className="text-xs text-slate-400 font-normal">
            (click to upload / change)
          </span>
        </span>
      )}
      <div
        onClick={handleClick}
        className={`${sizeClass} relative rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/30 ${
          uploading ? "cursor-wait opacity-70" : ""
        }`}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={alt}
              fill
              className="object-cover"
            />
            {!uploading && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <FiX className="w-5 h-5 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <FiUpload className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-[10px] text-slate-500">Upload</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
            <FiLoader className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <span className="text-xs text-slate-500">Uploading...</span>
      )}
    </div>
  );
};

export default ImageUpload;