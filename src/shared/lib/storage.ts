/**
 * Storage Client (Cloudflare R2 / AWS S3)
 * TruPlat - Texas V1
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

let s3Client: S3Client | null = null;
let storageConfig: StorageConfig | null = null;

function getConfig(): StorageConfig {
  if (!storageConfig) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      throw new Error("R2/S3 storage configuration is incomplete. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL");
    }

    storageConfig = {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    };
  }
  return storageConfig;
}

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = getConfig();

    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return s3Client;
}

export interface UploadUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresAt: Date;
}

/**
 * Generate a presigned URL for uploading a file
 */
export async function getUploadUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}): Promise<UploadUrlResult> {
  const client = getS3Client();
  const config = getConfig();
  const expiresIn = params.expiresIn || 3600;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `${config.publicUrl}/${params.key}`;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    uploadUrl,
    publicUrl,
    key: params.key,
    expiresAt,
  };
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getDownloadUrl(params: {
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}): Promise<string> {
  const client = getS3Client();
  const config = getConfig();
  const expiresIn = params.expiresIn || 3600;

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: params.key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  const config = getConfig();

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * Generate a unique key for evidence uploads
 */
export function generateEvidenceKey(params: {
  jobId: string;
  category: string;
  filename: string;
}): string {
  const timestamp = Date.now();
  const sanitizedFilename = params.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `evidence/${params.jobId}/${params.category}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Generate a unique key for report PDFs
 */
export function generateReportKey(params: {
  reportId: string;
  version?: number;
}): string {
  const version = params.version || 1;
  return `reports/${params.reportId}/report-v${version}.pdf`;
}

/**
 * Generate a unique key for profile photos
 */
export function generateProfilePhotoKey(params: {
  userId: string;
  filename: string;
}): string {
  const timestamp = Date.now();
  const ext = params.filename.split(".").pop() || "jpg";
  return `profiles/${params.userId}/${timestamp}.${ext}`;
}

/**
 * Get content type from filename
 */
export function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Validate file type for evidence uploads
 */
export function isValidEvidenceType(contentType: string): boolean {
  const validTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    // Audio (voice notes)
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/x-m4a",
  ];
  return validTypes.includes(contentType);
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  const config = getConfig();
  return `${config.publicUrl}/${key}`;
}

/**
 * Parse a public URL to get the key
 */
export function getKeyFromUrl(url: string): string | null {
  const config = getConfig();
  if (url.startsWith(config.publicUrl)) {
    return url.replace(`${config.publicUrl}/`, "");
  }
  return null;
}
