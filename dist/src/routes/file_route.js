"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const heic_convert_1 = __importDefault(require("heic-convert"));
const router = express_1.default.Router();
//
// Helper function for HEIC/HEIF detection
//
function isHeicOrHeif(buffer) {
    try {
        const header = buffer.slice(0, 12).toString('ascii');
        return header.includes('ftyp') && (header.includes('heic') || header.includes('heix') || header.includes('hevc') || header.includes('mif1'));
    }
    catch (error) {
        return false;
    }
}
//
// Update file storage and filtering to allow HEIC/HEIF files
//
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const tempDir = path_1.default.join(__dirname, '..', '..', 'temp');
        try {
            yield promises_1.default.mkdir(tempDir, { recursive: true });
            cb(null, tempDir);
        }
        catch (err) {
            cb(err, tempDir);
        }
    }),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const normalizedExt = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + normalizedExt);
    },
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Invalid file type or extension. Allowed: JPG, JPEG, PNG, GIF, WebP, HEIC, HEIF'));
        }
    },
});
//
// Updated /upload route with HEIC/HEIF conversion logic using heic-convert
//
router.post('/upload', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const newFilename = Date.now() + '.jpg';
        const uploadsDir = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
        yield promises_1.default.mkdir(uploadsDir, { recursive: true });
        const finalPath = path_1.default.join(uploadsDir, newFilename);
        // Read file buffer for checking and possible conversion
        const fileBuffer = (0, fs_1.readFileSync)(file.path);
        const isHeic = isHeicOrHeif(fileBuffer) || file.originalname.toLowerCase().endsWith('.heic') || file.originalname.toLowerCase().endsWith('.heif');
        if (isHeic) {
            try {
                // Convert HEIC to JPEG using heic-convert
                const outputBuffer = yield (0, heic_convert_1.default)({
                    buffer: fileBuffer, // the HEIC file buffer
                    format: 'JPEG', // output format
                    quality: 0.9, // quality between 0 and 1
                });
                // Process the converted image with sharp (rotate based on EXIF, etc.)
                yield (0, sharp_1.default)(outputBuffer).rotate().jpeg({ quality: 90 }).toFile(finalPath);
            }
            catch (heicError) {
                console.error('Error converting HEIC with heic-convert:', heicError);
                // Fallback: try processing directly with sharp
                yield (0, sharp_1.default)(file.path).rotate().jpeg({ quality: 90 }).toFile(finalPath);
            }
        }
        else {
            // Process non-HEIC images normally
            yield (0, sharp_1.default)(file.path).rotate().jpeg({ quality: 90 }).toFile(finalPath);
        }
        yield promises_1.default.unlink(file.path).catch((err) => {
            console.warn('Could not delete temporary file:', err);
        });
        res.json({
            url: `/uploads/${newFilename}`,
            message: 'File uploaded successfully',
        });
    }
    catch (error) {
        console.error('Upload route error:', error);
        if (req.file) {
            yield promises_1.default.unlink(req.file.path).catch(() => { });
        }
        res.status(500).json({
            message: 'Internal server error during file upload',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
exports.default = router;
//# sourceMappingURL=file_route.js.map