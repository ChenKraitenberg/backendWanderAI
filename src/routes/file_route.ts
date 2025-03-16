import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import heicConvert from 'heic-convert';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management
 */

//
// Helper function for HEIC/HEIF detection
//
function isHeicOrHeif(buffer: Buffer): boolean {
  try {
    const header = buffer.slice(0, 12).toString('ascii');
    return header.includes('ftyp') && (header.includes('heic') || header.includes('heix') || header.includes('hevc') || header.includes('mif1'));
  } catch (error) {
    return false;
  }
}

//
// Update file storage and filtering to allow HEIC/HEIF files
//
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (err: any) {
      cb(err as Error, tempDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const normalizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + normalizedExt);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const normalizedMimetype = file.mimetype.toLowerCase();
    const normalizedOriginalname = file.originalname.toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];

    const hasValidType = allowedTypes.includes(normalizedMimetype);
    const hasValidExtension = allowedExtensions.some((ext) => normalizedOriginalname.endsWith(ext));

    if (hasValidType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type or extension. Allowed: JPG, JPEG, PNG, GIF, WebP, HEIC, HEIF'));
    }
  },
});

/**
 * @swagger
 * /file/upload:
 *   post:
 *     summary: Upload an image file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error during upload
 */

router.post('/upload', upload.single('image'), async (req, res): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const newFilename = Date.now() + '.jpg';
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const finalPath = path.join(uploadsDir, newFilename);

    // Read file buffer for checking and possible conversion
    const fileBuffer = readFileSync(file.path);
    const isHeic = isHeicOrHeif(fileBuffer) || file.originalname.toLowerCase().endsWith('.heic') || file.originalname.toLowerCase().endsWith('.heif');

    if (isHeic) {
      try {
        // Convert HEIC to JPEG using heic-convert
        const outputBuffer = await heicConvert({
          buffer: fileBuffer, // the HEIC file buffer
          format: 'JPEG', // output format
          quality: 0.9, // quality between 0 and 1
        });
        // Process the converted image with sharp (rotate based on EXIF, etc.)
        await sharp(outputBuffer).rotate().jpeg({ quality: 90 }).toFile(finalPath);
      } catch (heicError) {
        console.error('Error converting HEIC with heic-convert:', heicError);
        // Fallback: try processing directly with sharp
        await sharp(file.path).rotate().jpeg({ quality: 90 }).toFile(finalPath);
      }
    } else {
      // Process non-HEIC images normally
      await sharp(file.path).rotate().jpeg({ quality: 90 }).toFile(finalPath);
    }

    await fs.unlink(file.path).catch((err) => {
      console.warn('Could not delete temporary file:', err);
    });

    res.json({
      url: `/uploads/${newFilename}`,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload route error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      message: 'Internal server error during file upload',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
