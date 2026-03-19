const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load biến môi trường từ `server/.env`
dotenv.config({ path: path.join(__dirname, ".env") });

// `server/data/products.js` đang đóng vai trò schema/model Mongoose
const Product = require("./data/products");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

async function connectMongo() {
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://vutuan2004vn_db_user:mnSGgqaO17Dg4eD9@cluster0.obafjy1.mongodb.net/?appName=Cluster0";
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

app.get("/api/products", async (req, res) => {
  try {
    if (!isMongoConnected()) return res.status(503).json([]);

    console.log("API /api/products called (from MongoDB)");
    const items = await Product.find({}).lean();
    // Trả về thêm `id` để frontend dùng `product.id` thay vì `_id`
    const mapped = items.map((p) => ({ ...p, id: p._id.toString() }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    const body = req.body || {};
    const created = await Product.create(body);
    const obj = created.toObject();
    res.status(201).json({ ...obj, id: obj._id.toString() });
  } catch (err) {
    // Lỗi validate field (name/price bắt buộc, kiểu dữ liệu không hợp lệ...)
    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const body = req.body || {};
    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    const obj = updated.toObject ? updated.toObject() : updated;
    res.json({ ...obj, id: obj._id.toString() });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // RESTful: xóa thành công thường trả 204
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

connectMongo()
  .then(async () => {
    if (!isMongoConnected()) console.log("MongoDB not connected yet - skipping seed");
  })
  .finally(() => {
    app.listen(5000, "0.0.0.0", () => {
      console.log("Server running on http://localhost:5000");
    });
  });
