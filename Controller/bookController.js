import { validationResult } from "express-validator";
import Books from "../Models/books.js";
import HttpError from "../middlewares/httpError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Create Signup
export const createBooks = async (req, res, next) => {
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

    console.log(req.body, 'req.body')

    const {
      title,
      description,
      price,
      author,
      genres,
      isDeleted = false,
    } = req.body;

    const { userId, role } = req.userData;

    console.log(userId, "userId", role, "role");

    if (role !== "admin") {
      return next(
        new HttpError("Access denied! Only admins can create books.", 403)
      );
    }

    console.log(req.file, "req.file");

    // Handle file upload if using multer
    const uploadedImage = req.file ? req.file.path : image;

    const newBook = await Books.create({
      title,
      genres,
      author,
      price,
      image: uploadedImage,
      description,
      isDeleted,
    });

    res.status(201).json({
      status: true,
      message: "Book added successfully!",
      data: newBook,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Process failed, please contact the admin. Product adding failed.",
        500
      )
    );
  }
};

//Get Books
export const getBooks = async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty())  {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }
    const books = await Books.find({ isDeleted: false }); // Fetch all books from the database

    if (!books.length) {
      return res.status(404).json({
        status: false,
        message: "No Books found",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Books retrieved successfully",
      access_token: null,
      data: books,
      totalBooks: books.length,
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
      return res
        .status(400)
        .json({
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





export const updateBooks = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("error", errors);
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

    // Find the book to get the old image
    const existingBook = await Books.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: "No Book found with this ID" });
    }


    let uploadedImage = existingBook.image; 
    if (req.file) {
      uploadedImage = req.file.path;
      
      // Delete old image if it exists
      if (existingBook.image) {
        const oldImagePath = path.join(__dirname, "../", existingBook.image);
        console.log(oldImagePath, 'oldImagePath')
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
        }
      }
    }

    // Update book with new details
    const updatedBook = await Books.findByIdAndUpdate(
      bookId,
      { title, description, price, author, genres, image: uploadedImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: true,
      message: "Book updated successfully...!",
      data: updatedBook,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Oops! Process failed, please contact admin", 500));
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
      { $limit: 3 } 
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
      new HttpError(
        "Oops! Failed to fetch books, please contact admin.",
        500
      )
    );
  }
};
