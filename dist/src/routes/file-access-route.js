"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: File Access
 *   description: File access and retrieval
 */
/**
 * @swagger
 * /file-access/{filename}:
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
router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    // Directory traversal prevention check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).send('Invalid filename');
        return;
    }
    //const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
    const filePath = path_1.default.join(uploadsDir, filename);
    // Check if file exists
    if (!fs_1.default.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        res.status(404).send('File not found');
        return; // Added missing return statement
    }
    // Send the file
    return res.sendFile(filePath);
});
exports.default = router;
//# sourceMappingURL=file-access-route.js.map