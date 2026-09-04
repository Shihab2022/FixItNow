import multer from 'multer';

/**
 * In-memory uploads — the raw buffer is handed straight to Cloudinary,
 * so nothing is persisted on the server's disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (
    _req: any,
    file: any,
    cb: (error: Error | null, acceptFile?: boolean) => void
) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
                cb(new Error('Only JPG, PNG, WEBP, GIF and AVIF images are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});