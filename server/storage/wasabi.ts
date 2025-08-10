import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure Wasabi S3 client
const wasabiEndpoint = new AWS.Endpoint(`https://s3.${process.env.WASABI_REGION}.wasabisys.com`);
const s3 = new AWS.S3({
  endpoint: wasabiEndpoint,
  region: process.env.WASABI_REGION,
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
});

// Configure multer for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.WASABI_BUCKET!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Generate unique filename with timestamp and UUID
      const timestamp = Date.now();
      const uuid = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}-${uuid}${extension}`;
      
      // Organize files by type
      let folder = 'uploads';
      if (file.mimetype.startsWith('image/')) {
        folder = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        folder = 'videos';
      } else if (file.mimetype === 'application/pdf') {
        folder = 'documents';
      }
      
      cb(null, `${folder}/${filename}`);
    },
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      });
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and PDFs
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
    }
  },
});

// Helper functions for file operations
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 10 }
]);

// Delete file from Wasabi
export const deleteFile = async (fileKey: string): Promise<boolean> => {
  try {
    await s3.deleteObject({
      Bucket: process.env.WASABI_BUCKET!,
      Key: fileKey,
    }).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from Wasabi:', error);
    return false;
  }
};

// Generate signed URL for private files
export const generateSignedUrl = (fileKey: string, expiresIn: number = 3600): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.WASABI_BUCKET!,
    Key: fileKey,
    Expires: expiresIn,
  });
};

// Get file metadata
export const getFileMetadata = async (fileKey: string) => {
  try {
    const result = await s3.headObject({
      Bucket: process.env.WASABI_BUCKET!,
      Key: fileKey,
    }).promise();
    return result;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
};

// List files in a folder
export const listFiles = async (prefix: string = '', maxKeys: number = 1000) => {
  try {
    const result = await s3.listObjectsV2({
      Bucket: process.env.WASABI_BUCKET!,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }).promise();
    return result.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

// Create folder structure
export const createFolder = async (folderName: string) => {
  try {
    await s3.putObject({
      Bucket: process.env.WASABI_BUCKET!,
      Key: `${folderName}/`,
      Body: '',
    }).promise();
    return true;
  } catch (error) {
    console.error('Error creating folder:', error);
    return false;
  }
};

// Copy file within bucket
export const copyFile = async (sourceKey: string, destinationKey: string) => {
  try {
    await s3.copyObject({
      Bucket: process.env.WASABI_BUCKET!,
      CopySource: `${process.env.WASABI_BUCKET}/${sourceKey}`,
      Key: destinationKey,
    }).promise();
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

export { s3 };