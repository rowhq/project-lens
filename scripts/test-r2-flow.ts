import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function testR2Upload() {
  // Load env vars
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  console.log("Config:");
  console.log(`  Account ID: ${accountId?.slice(0, 10)}...`);
  console.log(`  Access Key: ${accessKeyId?.slice(0, 10)}...`);
  console.log(`  Bucket: ${bucketName}`);
  console.log(`  Public URL: ${publicUrl}`);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error("Missing R2 credentials!");
    return;
  }

  // Create S3 client exactly like production
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // Generate presigned URL exactly like production
  const key = `reports/test-${Date.now()}/report-v1.pdf`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: "application/pdf",
  });

  console.log(`\nGenerating presigned URL for: ${key}`);
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  console.log(`Presigned URL preview: ${uploadUrl.substring(0, 100)}...`);

  // Create PDF content
  const content = Buffer.from("%PDF-1.4 test content\n%%EOF");
  const uint8Array = new Uint8Array(content);

  console.log(`\nUploading ${content.length} bytes...`);

  // Try the upload exactly like production
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: uint8Array,
    headers: {
      "Content-Type": "application/pdf",
    },
  });

  console.log(`Response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "No error body");
    console.error(`Error body: ${errorText}`);
    const headers = Object.fromEntries(response.headers.entries());
    console.error(`Response headers:`, headers);
  } else {
    console.log("SUCCESS!");
    console.log(`Public URL: ${publicUrl}/${key}`);
  }
}

testR2Upload().catch(console.error);
