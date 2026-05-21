import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const PRIVATE = process.env.S3_PRIVATE_BUCKET!
const PUBLIC  = process.env.S3_PUBLIC_BUCKET!
const CDN     = process.env.CLOUDFRONT_URL!

// Upload CV to private bucket
export async function uploadCV(
  buffer: Buffer,
  filename: string,
  applicationId: string,
): Promise<{ key: string }> {
  const ext = filename.split('.').pop() ?? 'pdf'
  const key = `cvs/${applicationId}/${randomUUID()}.${ext}`
  const contentType = ext === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  await s3.send(new PutObjectCommand({
    Bucket:      PRIVATE,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }))

  return { key }
}

// Pre-signed URL — expires in 1 hour
export async function getCVSignedUrl(key: string): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: PRIVATE, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn: 3600 })
}

// Upload company logo / team photo to public bucket
export async function uploadPublicImage(
  buffer: Buffer,
  filename: string,
  folder: 'logos' | 'team-photos',
  companyId: string,
): Promise<{ key: string; url: string }> {
  const ext = filename.split('.').pop() ?? 'png'
  const key = `${folder}/${companyId}/${randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket:      PUBLIC,
    Key:         key,
    Body:        buffer,
    ContentType: `image/${ext}`,
  }))

  return { key, url: `${CDN}/${key}` }
}

// Delete any object
export async function deleteObject(bucket: 'private' | 'public', key: string) {
  await s3.send(new DeleteObjectCommand({
    Bucket: bucket === 'private' ? PRIVATE : PUBLIC,
    Key:    key,
  }))
}
