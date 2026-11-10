
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    callback
) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [".xlsx", ".csv"];

    if (!allowedExtensions.includes(extension)) {
        return callback(
            new Error("Only Excel (.xlsx) and CSV (.csv) files are allowed")
        );
    }

    callback(null, true);
};

export const uploadSpreadsheet = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1,
    },
});
