"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn, formatFileSize } from "@/shared/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<{ id: string; url: string }[]>;
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = "image/*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onUpload,
  onRemove,
  disabled,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", "/"));
        }
        return file.type === type || file.name.endsWith(type);
      });

      if (!isAccepted) {
        return "File type not accepted.";
      }
    }

    return null;
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      // Check max files
      const remainingSlots = maxFiles - files.length;
      const filesToProcess = newFiles.slice(0, remainingSlots);

      // Validate and create file entries
      const fileEntries: UploadedFile[] = filesToProcess.map((file) => {
        const error = validateFile(file);
        return {
          id: Math.random().toString(36).slice(2),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: error ? "error" : "uploading",
          error,
        } as UploadedFile;
      });

      setFiles((prev) => [...prev, ...fileEntries]);

      // Upload valid files
      const validFiles = filesToProcess.filter((_, i) => !fileEntries[i].error);
      if (validFiles.length === 0) return;

      try {
        const results = await onUpload(validFiles);

        // Update file entries with results
        setFiles((prev) =>
          prev.map((f) => {
            const resultIndex = fileEntries.findIndex((fe) => fe.id === f.id);
            if (resultIndex >= 0 && results[resultIndex]) {
              return {
                ...f,
                url: results[resultIndex].url,
                status: "success" as const,
                progress: 100,
              };
            }
            return f;
          }),
        );
      } catch (error) {
        // Mark files as errored
        setFiles((prev) =>
          prev.map((f) => {
            if (
              fileEntries.some(
                (fe) => fe.id === f.id && f.status === "uploading",
              )
            ) {
              return {
                ...f,
                status: "error" as const,
                error: "Upload failed. Please try again.",
              };
            }
            return f;
          }),
        );
      }
    },
    [files.length, maxFiles, maxSize, accept, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, processFiles],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onRemove?.(fileId);
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed clip-notch p-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-brand-500 bg-brand-50"
            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <Upload
          className={cn(
            "w-10 h-10 mx-auto mb-3",
            isDragging ? "text-brand-500" : "text-neutral-400",
          )}
        />
        <p className="text-sm font-medium text-neutral-700">
          {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {accept === "image/*" ? "PNG, JPG, HEIC" : accept} up to{" "}
          {formatFileSize(maxSize)}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                {isImage(file.type) ? (
                  file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-neutral-400" />
                  )
                ) : (
                  <File className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(file.size)}
                </p>
                {file.status === "uploading" && (
                  <div className="w-full h-1 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                )}
                {file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
              </div>

              {/* Status / Actions */}
              <div className="flex-shrink-0">
                {file.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                )}
                {file.status === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(file.id)}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
