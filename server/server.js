const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

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
  const hasEnv = Boolean(process.env.MONGODB_URI);
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://vutuan2004vn_db_user:mnSGgqaO17Dg4eD9@cluster0.obafjy1.mongodb.net/?appName=Cluster0";
  try {
    console.log("MONGODB_URI loaded from .env:", hasEnv ? "yes" : "no");
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function normalizeImagePath(image) {
  // Chỉ phục vụ ảnh qua express.static("public") => path phải là dạng "/images/..."
  if (typeof image === "string" && image.startsWith("/images/")) return image;
  return "/images/hoa1.jpg";
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const imagesDir = path.join(__dirname, "public", "images");
ensureDirSync(imagesDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || ".jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, filename);
  },
});

const fileFilter = function (req, file, cb) {
  if (!file) return cb(null, true);
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);
  if (allowed.has(file.mimetype)) return cb(null, true);
  return cb(null, false);
};

const upload = multer({ storage, fileFilter });

app.get("/api/products", async (req, res) => {
  try {
    if (!isMongoConnected()) return res.status(503).json([]);

    console.log("API /api/products called (from MongoDB)");
    const items = await Product.find({}).lean();
    // Trả về thêm `id` để frontend dùng `product.id` thay vì `_id`
    const mapped = items.map((p) => ({
      ...p,
      id: p._id.toString(),
      image: normalizeImagePath(p.image),
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

app.post("/api/products", upload.single("imageFile"), async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    // Nếu gửi file upload thì tự set path cho field `image`
    if (req.file && req.file.filename) {
      req.body.image = `/images/${req.file.filename}`;
    }

    const body = req.body || {};
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined && body.stock !== "") body.stock = Number(body.stock);
    const created = await Product.create(body);
    const obj = created.toObject();
    res.status(201).json({
      ...obj,
      id: obj._id.toString(),
      image: normalizeImagePath(obj.image),
    });
  } catch (err) {
    // Lỗi validate field (name/price bắt buộc, kiểu dữ liệu không hợp lệ...)
    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.put("/api/products/:id", upload.single("imageFile"), async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (req.file && req.file.filename) {
      req.body.image = `/images/${req.file.filename}`;
    }

    const body = req.body || {};
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined && body.stock !== "") body.stock = Number(body.stock);
    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    const obj = updated.toObject ? updated.toObject() : updated;
    res.json({
      ...obj,
      id: obj._id.toString(),
      image: normalizeImagePath(obj.image),
    });
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
