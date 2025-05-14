import express from "express";
import {
  createBooks,
  DeleteBook,
  getBooks,
  getBooksById,
  getTopRatedBooks,
  updateBooks,
} from "../Controller/bookController.js";
import { check } from "express-validator";
import authCheck from "../middlewares/authCheck.js";
import multerConfig from "../middlewares/multer/uploadImage.js";
import createMultipleFileupload from "../middlewares/multer/createMultipleFileupload.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const router = express.Router();

router.post("/getAll", getBooks);
router.post("/topRatedBooks", getTopRatedBooks);
router.use(authCheck);

router.post(
  "/addBooks",
  createMultipleFileupload('cover_image'),
  [
    check("genres").not().isEmpty(),
    check("price").not().isEmpty(),
    check("description").not().isEmpty(),
    check("title").not().isEmpty(),
    check("author").not().isEmpty(),
  ],
  createBooks
);

router.post("/viewBook", [check("bookId").not().isEmpty()], getBooksById);

router.patch(
  "/updateBook",
  createMultipleFileupload('cover_image'),
  [check("bookId").not().isEmpty()],
  updateBooks
);

router.patch("/delete", [check("bookId").not().isEmpty()], DeleteBook);

export default router;
