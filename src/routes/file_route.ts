/*import express from "express";
const router = express.Router();
import multer from "multer";

const base = process.env.DOMAIN_BASE + "/";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage/')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')
            .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
            .slice(1)
            .join('.')
        cb(null, Date.now() + "." + ext)
    }
})
const upload = multer({ storage: storage });

router.post('/', upload.single("file"), function (req, res) {
    console.log("router.post(/file: " + base + req.file?.path)
    res.status(200).send({ url: base + req.file?.path })
});
export = router;
*/
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// POST /file
router.post('/', upload.single('file'), (req, res) => {
  res.status(200).send({ url: req.file?.path });
});

export default router;
