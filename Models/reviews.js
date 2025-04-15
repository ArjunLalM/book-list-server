import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const reviewSchema = new mongoose.Schema(
    {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model
          required: true,
        },
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Books", // Reference to the Book model
          required: true,
        },
        review: {
          type: String,
          required: true,
        },
        ratings: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
      { timestamps: true }
)

reviewSchema.plugin(mongooseUniqueValidator)
const Reviews = new mongoose.model('reviews', reviewSchema)

export default Reviews