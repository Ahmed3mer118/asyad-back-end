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
const MB = 1024 * 1024

const uploads = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 10 * MB
    }
});

module.exports = uploads;