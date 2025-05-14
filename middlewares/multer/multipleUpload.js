import multer from 'multer'
import fs from 'fs'


// Configure multer storage and file name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/books/cover_image');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create multer upload instance
  const upload = multer({ storage: storage });
  
  // Custom file upload middleware
  const uploadMiddleware = (req, res, next) => {
    // Use multer upload instance
    upload.array('cover_image', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      // Retrieve uploaded files
      const files = req.files;
      const errors = [];
  
      // Validate file types and sizes
      files.forEach((file) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024;
  
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
  
  export default uploadMiddleware