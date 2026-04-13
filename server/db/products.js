const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "/images/cake1.jpg",
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    type: {
      id: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "CakeCandy",
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
