import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: File Access
 *   description: File access and retrieval
 */

/**
 * @swagger
 * /api/file-access/{filename}:
 *   get:
 *     summary: Access an uploaded file by filename
 *     tags: [File Access]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to retrieve
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filename
 *       404:
 *         description: File not found
 */
router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;

  // Directory traversal prevention check
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).send('Invalid filename');
    return;
  }

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    res.status(404).send('File not found');
    return; // Added missing return statement
  }

  // Send the file
  return res.sendFile(filePath);
});

export default router;
