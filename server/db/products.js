const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String },

    price: { type: Number, required: true, min: 0 },

    image: { type: String, default: "/images/cake1.jpg" },

    stock: { type: Number, min: 0, default: 0 },

    type: {
      id: { type: String },
      name: { type: String },
    },

    tags: [{ type: String }],

    events: [{ type: String }],
  },
  {
    collection: "CakeCandy",
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);