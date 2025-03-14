"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    // בדיקה למניעת directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).send('Invalid filename');
        return;
    }
    const uploadsDir = path_1.default.join(__dirname, '..', 'public', 'uploads');
    const filePath = path_1.default.join(uploadsDir, filename);
    // בדיקה אם הקובץ קיים
    if (!fs_1.default.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        res.status(404).send('File not found');
    }
    // שליחת הקובץ
    return res.sendFile(filePath);
});
exports.default = router;
//# sourceMappingURL=file-access-route.js.map