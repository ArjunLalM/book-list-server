import { validationResult } from "express-validator";
import Books from "../Models/books.js";
import HttpError from "../middlewares/httpError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createBooks = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data and try again!",
          422
        )
      );
    }

    const {
      title,
      description,
      price,
      author,
      genres,
      isDeleted = false,
    } = req.body;

    console.log(req.body, "req.body");

    const { userId, role } = req.userData;
    console.log(userId, "userId", role, "role");

    if (role !== "admin") {
      return next(
        new HttpError("Access denied! Only admins can create books.", 403)
      );
    }

    // Handle multiple image uploads from multer
    console.log(req.files, "******************************************");
    // const uploadedImages = req.files ? req.files.map((file) => file.path) : [];
    const files = req.files;
    const uploadedImage = [];

    files.forEach((file) => {
      const filePath = `${file.path}`;
      fs.rename(file.path, filePath, (err) => {
        if (err) {
          // Handle error appropriately and send an error response
          return res.status(500).json({ error: "Failed to store the file" });
        }
      });
      uploadedImage.push(filePath);
    });
    // const uploadedImage = []
    console.log("Uploaded Images:", uploadedImage);

    const newBook = await Books.create({
      title,
      genres,
      author,
      price,
      description,
      isDeleted,
      images: uploadedImage,
    });

    res.status(201).json({
      status: true,
      message: "Book added successfully!",
      data: newBook,
    });
  } catch (err) {
    console.error("Error creating book:", err);
    return next(
      new HttpError(
        "Oops! Process failed, please contact the admin. Book adding failed.",
        500
      )
    );
  }
};

//Get Books
// export const getBooks = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log("Validation Error:", errors);
//       return next(
//         new HttpError(
//           "Invalid data inputs passed. Please check your data before retrying!",
//           422
//         )
//       );
//     }

//     const books = await Books.find({ isDeleted: false });

//     if (!books.length) {
//       return res.status(404).json({
//         status: false,
//         message: "No Books found",
//         data: [],
//       });
//     }

//     console.log(books,"books from api")

//     res.status(200).json({
//       status: true,
//       message: "Books retrieved successfully",
//       access_token: null,
//       data: books,
//       totalBooks: books.length,
//     });
//   } catch (err) {
//     console.error(err);
//     return next(
//       new HttpError(
//         "Oops! Failed to fetch products, please contact admin.",
//         500
//       )
//     );
//   }
// };
export const getBooks = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    // Extract pagination parameters
    let page = parseInt(req.body.page) || 0;
    let pageSize = parseInt(req.body.pageSize) || 8;
    const skip = page * pageSize;

    // Count total documents (not deleted)
    const totalBooksCount = await Books.countDocuments({ isDeleted: false });

    // Fetch paginated books
    const books = await Books.aggregate([
      { $match: { isDeleted: false } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    if (!books.length) {
      return res.status(404).json({
        status: false,
        message: "No Books found",
        data: [],
      });
    }
    console.log("Page:", req.body.page, "PageSize:", req.body.pageSize);

    res.status(200).json({
      status: true,
      message: "Books retrieved successfully",
      access_token: null,
      data: books,
      totalBooks: totalBooksCount,
      currentPage: page,
      pageSize: pageSize,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Failed to fetch products, please contact admin.",
        500
      )
    );
  }
};

// Get Single Book by ID
export const getBooksById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    const { bookId } = req.body; // Extracting bookId from req.body
    console.log(req.body);
    if (!bookId) {
      return res.status(400).json({
        status: false,
        message: "Book ID is required in the request body",
      });
    }

    const book = await Books.findById({ _id: bookId });

    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Process failed, please contact the admin. Book retrieval failed.",
        500
      )
    );
  }
};
//Update Books
export const updateBooks = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { title, description, price, author, genres, bookId } = req.body;
    const { userId, role } = req.userData;

    if (role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Access denied! Only admins can update books.",
      });
    }

    const existingBook = await Books.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: "No Book found with this ID" });
    }
    // Delete old image files from local storage
    if (existingBook.images && existingBook.images.length > 0) {
      existingBook.images.forEach((imagePath) => {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${imagePath}`, err);
          } else {
            console.log(`Deleted old file: ${imagePath}`);
          }
        });
      });
    }
    // let uploadedImages = existingBook.images || [];

    // Handle multiple image uploads from multer
    console.log(req.files, "******************************************");
    // const uploadedImages = req.files ? req.files.map((file) => file.path) : [];
    const files = req.files;
    const uploadedImage = [];

    files.forEach((file) => {
      const filePath = `${file.path}`;
      fs.rename(file.path, filePath, (err) => {
        if (err) {
          // Handle error appropriately and send an error response
          return res.status(500).json({ error: "Failed to store the file" });
        }
      });
      uploadedImage.push(filePath);
    });
    // const uploadedImage = []
    console.log("Uploaded Images:", uploadedImage);

    const updatedBook = await Books.findByIdAndUpdate(
      bookId,
      {
        title,
        description,
        price,
        author,
        genres,
        images: uploadedImage,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: true,
      message: "Book updated successfully...!",
      data: updatedBook,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};

//softDeleteBook By ID
export const DeleteBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { userId, role } = req.userData;
    console.log(userId, "userId", role, "role");
    if (role !== "admin") {
      return next(
        new HttpError("Access denied! Only admins can create books.", 403)
      );
    }

    const { bookId } = req.body;

    // Check if the book exists
    const book = await Books.findById({ _id: bookId });
    if (!book) {
      return next(new HttpError("Book not found!", 404));
    }

    // Update isDeleted to true
    book.isDeleted = true;
    await book.save();

    res.status(200).json({
      status: true,
      message: "Book deleted successfully (soft delete)!",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to delete the book!", 500));
  }
};

export const getTopRatedBooks = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    const books = await Books.aggregate([
      { $match: { isDeleted: false } },
      { $sort: { rating: -1 } },
      { $limit: 3 },
    ]);

    if (!books.length) {
      return res.status(404).json({
        status: false,
        message: "No Books found",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Top 3 Books retrieved successfully",
      access_token: null,
      data: books,
      totalBooks: books.length,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Failed to fetch books, please contact admin.", 500)
    );
  }
};
