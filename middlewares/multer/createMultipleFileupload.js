import multer from 'multer';
import fs from 'fs';
import filesConfig from '../../Config/files.js'; // Adjust the import path as needed
import formatFileName from '../utils/multer/getFileName.js';
import createDirectoryIfNotExists from './createDirectory.js';

/**
 * Utility function to check mime type
 * @param {Object} file - The file object from multer.
 * @param {Function} cb - The callback function.
 */
const checkMimeType = (file, cb) => {
  const config = filesConfig.uploads[file.fieldname];
  if (!config) {
    return cb(new Error('Invalid file configuration'));
  }

  const allowedTypes = config.supportedTypes;
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const defaultMaximumFileSize = 1024 * 1024 * 10;

/**
 * Helper function to create a multer upload instance
 * @param {string} fieldname - The field name in the form data.
 * @param {number} [maxSize=defaultMaximumFileSize] - The maximum file size allowed.
 * @returns {multer} The multer upload instance.
 */
const createMultipleFileupload = (fieldname, maxSize = defaultMaximumFileSize, maxLength = 5) => {
  const config = filesConfig.uploads[fieldname];
  if (!config) {
    throw new Error(`No upload configuration found for fieldname: ${fieldname}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const pathDirectory = `${filesConfig.uploads.root_directory}/${config.savedDirectory}`;
      createDirectoryIfNotExists(pathDirectory);
      cb(null, pathDirectory);
    },
    filename: (req, file, cb) => {
      const filename = formatFileName(file.originalname);
      cb(null, filename);
    },
  });

  const upload =  multer({
    storage,
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, cb) => {
      checkMimeType(file, cb);
    },
  });

  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldname, maxLength);

    uploadMiddleware(req, res, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
    
        // Retrieve uploaded files
        const files = req.files;
        const errors = [];
    
        // Validate file types and sizes
        files.forEach((file) => {
          const allowedTypes = config.supportedTypes;
          const maxSize = 5 * 1024 * 1024; // 5MB
    
          if (!allowedTypes.includes(file.mimetype)) {
            errors.push(`Invalid file type: ${file.originalname}`);
          }
    
          if (file.size > maxSize) {
            errors.push(`File too large: ${file.originalname}`);
          }
        });
    
        // Handle validation errors
        if (errors.length > 0) {
          // Remove uploaded files
          files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
    
          return res.status(400).json({ errors });
        }
    
        // Attach files to the request object
        req.files = files;
    
        // Proceed to the next middleware or route handler
        next();
      });
  };

};

export default createMultipleFileupload;
