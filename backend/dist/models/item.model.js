import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others",
        ],
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    foodType: {
        type: String,
        required: true,
        enum: ["veg", "non-veg"]
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });
const Item = mongoose.model("Item", itemSchema) || mongoose.models.Item;
export default Item;
