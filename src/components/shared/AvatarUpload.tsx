"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, Trash2, Loader2, User } from "lucide-react";
import { uploadAvatarAction, removeAvatarAction } from "@/lib/actions/avatar";

interface AvatarUploadProps {
    currentImageUrl?: string | null;
    userName?: string;
    onAvatarChange?: (url: string | null) => void;
    size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({
    currentImageUrl,
    userName = "User",
    onAvatarChange,
    size = "md",
}: AvatarUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "w-16 h-16 text-lg",
        md: "w-24 h-24 text-2xl",
        lg: "w-32 h-32 text-4xl",
    }[size];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const result = await uploadAvatarAction(formData);
            if (result.success && result.imageUrl) {
                setPreviewUrl(result.imageUrl);
                onAvatarChange?.(result.imageUrl);
            } else {
                setError(result.error || "Upload failed. Please try again.");
                setPreviewUrl(currentImageUrl || null);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload error occurred.");
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = async () => {
        setIsUploading(true);
        setError(null);
        try {
            const result = await removeAvatarAction();
            if (result.success) {
                setPreviewUrl(null);
                onAvatarChange?.(null);
            } else {
                setError(result.error || "Failed to remove avatar.");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to remove avatar.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar Preview Container */}
            <div className="relative group">
                <div
                    className={`${sizeClasses} rounded-full overflow-hidden border-2 border-border bg-[color:var(--surface-2)] flex items-center justify-center shrink-0 shadow-sm relative`}
                >
                    {previewUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={previewUrl}
                            alt={userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-bold text-foreground-muted select-none">
                            {userName.charAt(0).toUpperCase()}
                        </span>
                    )}

                    {/* Uploading Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs z-10">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Quick Camera Badge */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--brand-green)] text-white shadow-md hover:opacity-90 transition-opacity border-2 border-background"
                    title="Upload photo"
                    aria-label="Upload photo"
                >
                    <Camera className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Upload Controls & Guidelines */}
            <div className="space-y-2 text-center sm:text-left">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-border bg-background text-foreground text-xs font-semibold hover:bg-[color:var(--surface-2)] transition-colors shadow-xs"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Upload new photo
                    </button>

                    {previewUrl && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isUploading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                        </button>
                    )}
                </div>

                <p className="text-[11px] text-foreground-muted">
                    Recommended: Square JPG, PNG, or WebP. Max 5MB. Auto-optimized via Sanity CDN.
                </p>

                {error && (
                    <p className="text-xs text-red-600 font-medium" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
