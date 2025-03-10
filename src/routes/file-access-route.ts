import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;

  // בדיקה למניעת directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).send('Invalid filename');
    return;
  }

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const filePath = path.join(uploadsDir, filename);

  // בדיקה אם הקובץ קיים
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    res.status(404).send('File not found');
  }

  // שליחת הקובץ
  return res.sendFile(filePath);
});

export default router;
