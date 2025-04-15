import Reviews from "../Models/reviews.js";
import { validationResult } from "express-validator";
import HttpError from "../middlewares/httpError.js";

export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }

    const { bookId, review, ratings } = req.body;
    const { role, userId } = req.userData;

    console.log(userId, "userId", role, "role");

    // Check if user has the correct role
    if (role !== "user") {
      return next(
        new HttpError("Access denied! Only user can create reviews.", 403)
      );
    }

    console.log(review, ratings, bookId, "****************");
    // Create new review in the database
    const newReview = await Reviews.create({
      review: review,
      ratings,
      user: userId,
      book: bookId,
    });

    // Respond with success
    res.status(201).json({
      status: true,
      message: "Review added successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Review adding failed. Please contact the admin.",
        500
      )
    );
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }

    const { bookId, review, ratings, reviewId } = req.body;
    const { role, userId } = req.userData;

    console.log(userId, "userId", role, "role");

    // Check if user has the correct role
    if (role !== "user") {
      return next(
        new HttpError("Access denied! Only user can edit reviews.", 403)
      );
    }

    // Create new review in the database
    const newReview = await Reviews.findByIdAndUpdate(
      { _id: reviewId },
      {
        review: review,
        ratings,
        user: userId,
        book: bookId,
      }
    );

    // Respond with success
    res.status(201).json({
      status: true,
      message: "Review added successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Review adding failed. Please contact the admin.",
        500
      )
    );
  }
};

//GET BOOK REVIEWS
export const getBookReviews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }
    const { bookId } = req.body;
    console.log('bookId',bookId)
    const reviews = await Reviews.find({ book: bookId }).populate("user");

    if (!reviews.length) {
      return next(new HttpError("No reviews found for this book.", 404));
    }

    res.status(200).json({
      status: true,
      message: "get book successfully",
      data: reviews,
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
