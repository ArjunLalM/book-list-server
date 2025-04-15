import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const booksSchema = new mongoose.Schema({

    title : {
        type: String,
        required : true,
        trim: true
    },
    description:{
        type:String,
        required:true
    },
    author: {
        type: String,
        required: true
    },
    genres:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default: false
    },
    price:{
        type:Number,
        required:true
    }
},
    { timestamps: true }
)

booksSchema.plugin(mongooseUniqueValidator)
const Books = new mongoose.model('books', booksSchema)

export default Books