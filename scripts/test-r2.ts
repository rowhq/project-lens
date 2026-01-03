/**
 * Test R2 Storage Connection
 * Run with: npx tsx scripts/test-r2.ts
 */

import {
  S3Client,
  PutObjectCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { readFileSync } from "fs";

// Load .env file manually
const envContent = readFileSync(".env", "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    process.env[key.trim()] = value.trim();
  }
});

async function testR2() {
  console.log("Testing R2 Storage Connection...\n");

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  console.log("Configuration:");
  console.log(`  Account ID: ${accountId}`);
  console.log(`  Access Key ID: ${accessKeyId?.substring(0, 8)}...`);
  console.log(
    `  Secret Key: ${secretAccessKey ? "***configured***" : "MISSING"}`,
  );
  console.log(`  Bucket Name: ${bucketName}`);
  console.log(`  Public URL: ${publicUrl}`);
  console.log();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error("❌ Missing required R2 configuration");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // Test 1: Generate signed URL
  console.log("Test 1: Generating signed URL...");
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: "test/connection-test.txt",
      ContentType: "text/plain",
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log(`✅ Signed URL generated: ${signedUrl.substring(0, 80)}...`);
    console.log();

    // Test 2: Upload using signed URL
    console.log("Test 2: Uploading test file via signed URL...");
    const testContent = `Test file created at ${new Date().toISOString()}`;

    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: testContent,
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(testContent).toString(),
      },
    });

    if (uploadResponse.ok) {
      console.log("✅ Upload successful!");
      console.log(`   Public URL: ${publicUrl}/test/connection-test.txt`);
    } else {
      console.log(
        `❌ Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
      );
      const body = await uploadResponse.text();
      console.log(`   Response body: ${body}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testR2();
