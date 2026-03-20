import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME ?? "",
    folderPrefix: process.env.AWS_FOLDER_PREFIX ?? ""
  };
}

export function createS3Client() {
  return new S3Client({
    region: (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "auto").trim(),
    endpoint: process.env.AWS_ENDPOINT_URL?.trim() || undefined,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || "",
    },
  });
}
