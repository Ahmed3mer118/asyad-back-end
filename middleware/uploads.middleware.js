const multer = require('multer');
const path = require('path');
// text/html => mine type
// npm i file-type => chick mine file after upload
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif'];
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
        cb(null, true);
    } else {
        return cb(new Error('Invalid file type'));
    }

};
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const MB = 1024 * 1024

const uploads = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * MB
    }
});

module.exports = uploads;