// export default router;
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const router = express.Router();
const upload = multer({ dest: 'temp/' });

// Helper function to detect HEIC/HEIF files
function isHeicOrHeif(buffer: Buffer): boolean {
  try {
    // Check for HEIC/HEIF signature in the file header
    const header = buffer.slice(0, 12).toString('ascii');
    return header.includes('ftyp') && (header.includes('heic') || header.includes('heix') || header.includes('hevc') || header.includes('mif1'));
  } catch (error) {
    return false;
  }
}

// Helper function to convert HEIC to JPEG using sips (macOS)
interface ConvertHeicToJpeg {
  (inputPath: string, outputPath: string): Promise<void>;
}

const convertHeicToJpeg: ConvertHeicToJpeg = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    // Using macOS's sips command to convert
    const sips = spawn('sips', ['-s', 'format', 'jpeg', inputPath, '--out', outputPath]);

    sips.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`sips process exited with code ${code}`));
      }
    });

    sips.on('error', (err: Error) => {
      reject(err);
    });
  });
};

router.post('/upload', upload.single('image'), async (req, res): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'לא נבחר קובץ' });
      return;
    }

    // יצירת שם קובץ חדש לפי timestamp
    const newFilename = Date.now() + '.jpg';
    const finalPath = path.join(__dirname, '..', '..', 'public', 'uploads', newFilename);

    // Check if the file is HEIC/HEIF
    const fileBuffer = fs.readFileSync(file.path);
    const isHeic = isHeicOrHeif(fileBuffer) || file.originalname.toLowerCase().endsWith('.heic') || file.originalname.toLowerCase().endsWith('.heif');

    if (isHeic) {
      // For macOS - use sips for conversion
      const tempJpegPath = file.path + '.jpg';
      try {
        await convertHeicToJpeg(file.path, tempJpegPath);

        // Now process the converted jpeg with sharp and maintain orientation
        await sharp(tempJpegPath)
          .rotate() // Correct rotation based on EXIF data
          .jpeg({ quality: 90 })
          .toFile(finalPath);

        // Clean up the temp jpeg
        fs.unlinkSync(tempJpegPath);
      } catch (heicError) {
        console.error('Error converting HEIC:', heicError);

        // Fallback - try direct processing with sharp anyway
        try {
          await sharp(file.path)
            .rotate() // Try to maintain correct orientation
            .jpeg({ quality: 90 })
            .toFile(finalPath);
        } catch (sharpError) {
          throw new Error(`Failed to process HEIC image: ${(heicError as Error).message}, Sharp fallback also failed: ${(sharpError as Error).message}`);
        }
      }
    } else {
      // Process regular image formats with rotation handling
      await sharp(file.path)
        .rotate() // This automatically rotates based on EXIF data
        .jpeg({ quality: 90 })
        .toFile(finalPath);
    }

    // מחיקת הקובץ הזמני
    fs.unlinkSync(file.path);

    // החזרת הנתיב ללקוח
    res.json({ url: `/uploads/${newFilename}` });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      message: 'שגיאה בעיבוד הקובץ',
      error: (error as Error).message,
      serverErrorDetails: error,
    });
  }
});

export default router;
