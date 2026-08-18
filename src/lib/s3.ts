import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

function getS3Client() {
  return new S3Client({
    region: requireEnv("AWS_S3_REGION"),
    credentials: {
      accessKeyId: requireEnv("AWS_S3_ACCESS_KEY"),
      secretAccessKey: requireEnv("AWS_S3_SECRET_KEY"),
    },
  });
}

export async function getRecordingDownloadUrl(key: string) {
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: requireEnv("AWS_S3_BUCKET"), Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function deleteRecordingFile(key: string) {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: requireEnv("AWS_S3_BUCKET"), Key: key }));
}
