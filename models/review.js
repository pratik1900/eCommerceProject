const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    text: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    product: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    },
    rating: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Review", reviewSchema);