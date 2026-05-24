"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3() {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Convex env."
    );
  }
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error(
      "S3_BUCKET environment variable not configured in Convex env."
    );
  }
  return bucket;
}

export const getUploadUrl = action({
  args: {
    sessionId: v.id("sessions"),
    folder: v.union(
      v.literal("rubric"),
      v.literal("reference"),
      v.literal("ungraded")
    ),
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, args) => {
    const s3 = getS3();
    const bucket = getBucket();
    const safe = args.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `sessions/${args.sessionId}/${args.folder}/${Date.now()}-${safe}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: args.contentType,
      }),
      { expiresIn: 3600 }
    );
    return { uploadUrl: url, s3Key: key };
  },
});

export const getDownloadUrl = action({
  args: { s3Key: v.string() },
  handler: async (_ctx, args) => {
    const s3 = getS3();
    const bucket = getBucket();
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: args.s3Key }),
      { expiresIn: 3600 }
    );
    return { downloadUrl: url };
  },
});

export const isConfigured = action({
  args: {},
  handler: async () => {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET
    );
  },
});
