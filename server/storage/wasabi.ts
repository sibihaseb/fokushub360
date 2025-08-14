import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure Wasabi S3 client
const s3Client = new S3Client({
  region: process.env.WASABI_REGION || 'us-east-1',
  endpoint: `https://s3.${process.env.WASABI_REGION || 'us-east-1'}.wasabisys.com`,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for Wasabi
});

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
    }
  },
});

// Interface for file upload result
export interface FileUploadResult {
  key: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
}

// Helper function to upload a single file
export async function uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<FileUploadResult> {
  const timestamp = Date.now();
  const uuid = uuidv4();
  const extension = path.extname(file.originalname);
  const filename = `${timestamp}-${uuid}${extension}`;
  let targetFolder = folder;
  if (file.mimetype.startsWith('image/')) {
    targetFolder = 'images';
  } else if (file.mimetype.startsWith('video/')) {
    targetFolder = 'videos';
  } else if (file.mimetype === 'application/pdf') {
    targetFolder = 'documents';
  }
  const key = `${targetFolder}/${filename}`;

  // Debug: Check file buffer integrity
  console.log('WASABI UPLOAD DEBUG:', {
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    bufferLength: file.buffer?.length || 0,
    hasBuffer: !!file.buffer,
    bufferType: typeof file.buffer,
    key,
  });

  if (!file.buffer || file.buffer.length === 0) {
    console.error('CRITICAL: File buffer is empty or undefined');
    throw new Error('File buffer is empty or corrupted');
  }

  if (file.buffer.length !== file.size) {
    console.error('CRITICAL: File buffer size mismatch', {
      bufferLength: file.buffer.length,
      reportedSize: file.size,
      filename: file.originalname,
    });
    throw new Error(`File buffer size mismatch: buffer=${file.buffer.length}, size=${file.size}`);
  }

  const uploadParams = {
    Bucket: process.env.WASABI_BUCKET!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    Metadata: {
      fieldName: file.fieldname,
      originalName: file.originalname,
      uploadedBy: 'anonymous', // Adjust based on your auth setup (e.g., req.user?.id)
      uploadedAt: new Date().toISOString(),
    },
  };

  // Retry upload logic
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`WASABI UPLOAD ATTEMPT ${attempt}/${maxRetries}:`, {
        key,
        bufferLength: file.buffer.length,
        size: file.size,
        mimetype: file.mimetype,
      });

      const result = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('WASABI UPLOAD SUCCESS:', {
        key,
        etag: result.ETag,
        versionId: result.VersionId,
        attempt,
      });

      const url = `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${process.env.WASABI_BUCKET}/${key}`;

      return {
        key,
        url,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      lastError = error;
      console.error(`WASABI UPLOAD ATTEMPT ${attempt} FAILED:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Error uploading file to Wasabi after all retries:', lastError);
  throw new Error(`Failed to upload file to cloud storage after ${maxRetries} attempts`);
}

// Multer middleware
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 10 },
]);

// Delete file from Wasabi
export const deleteFile = async (fileKey: string): Promise<boolean> => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: fileKey,
      })
    );
    return true;
  } catch (error) {
    console.error('Error deleting file from Wasabi:', error);
    return false;
  }
};

// Generate signed URL for private files
export const generateSignedUrl = async (fileKey: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: fileKey,
      }),
      { expiresIn }
    );
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (fileKey: string) => {
  try {
    const result = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: fileKey,
      })
    );
    return result;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
};

// List files in a folder
export const listFiles = async (prefix: string = '', maxKeys: number = 1000) => {
  try {
    const result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.WASABI_BUCKET!,
        Prefix: prefix,
        MaxKeys: maxKeys,
      })
    );
    return result.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

// Create folder structure
export const createFolder = async (folderName: string) => {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: `${folderName}/`,
        Body: '',
      })
    );
    return true;
  } catch (error) {
    console.error('Error creating folder:', error);
    return false;
  }
};

// Copy file within bucket
export const copyFile = async (sourceKey: string, destinationKey: string) => {
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        CopySource: `${process.env.WASABI_BUCKET}/${sourceKey}`,
        Key: destinationKey,
      })
    );
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

// Get public URL for file
export const getPublicUrl = (fileKey: string): string => {
  return `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${process.env.WASABI_BUCKET}/${fileKey}`;
};

export { s3Client };