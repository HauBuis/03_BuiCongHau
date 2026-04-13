const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const Product = require("./db/products");

const app = express();
const publicDir = path.join(__dirname, "public");
const IMAGE_DIRECTORY_PATH = "/images";
const DEFAULT_IMAGE_PATH = "/images/cake1.jpg";
const CAKE_TYPE_IDS = ["T01", "T02", "T04", "T05", "T06"];
const CANDY_TYPE_IDS = ["T03", "T07"];
const PRODUCT_TYPE_GROUPS = {
  "banh-ngot": {
    ids: CAKE_TYPE_IDS,
    label: "Bánh ngọt",
    namePattern: /bánh/i,
  },
  "keo-ngot": {
    ids: CANDY_TYPE_IDS,
    label: "Kẹo ngọt",
    namePattern: /kẹo/i,
  },
};
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

async function connectMongo() {
  const hasEnv = Boolean(process.env.MONGODB_URI);
  const dbName = process.env.MONGODB_DB_NAME || "Cake";
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://conghau0704900193_db_user:0862049637@flower.ldto7ql.mongodb.net/?appName=Flower";

  try {
    console.log("MONGODB_URI loaded from .env:", hasEnv ? "yes" : "no");
    console.log("MongoDB database:", dbName);
    await mongoose.connect(mongoURI, { dbName });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeVietnameseText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildCategoryFilter(categoryValue) {
  const normalized = String(categoryValue || "").trim().toLowerCase();

  if (!normalized) {
    return {};
  }

  const normalizedCategoryKey =
    normalized === "keo-snack" ? "keo-ngot" : normalized;
  const groupedCategory = PRODUCT_TYPE_GROUPS[normalizedCategoryKey];

  if (groupedCategory) {
    return {
      $or: [
        { "type.id": normalizedCategoryKey },
        { "type.id": { $in: groupedCategory.ids } },
        { "type.name": groupedCategory.namePattern },
      ],
    };
  }

  return {
    $or: [
      { "type.id": normalized },
      { "type.name": new RegExp(escapeRegExp(normalized), "i") },
    ],
  };
}

function normalizeProductType(type) {
  if (!type || typeof type !== "object") {
    return type;
  }

  const rawId = String(type.id || "").trim().toUpperCase();
  const rawName = String(type.name || "").trim();
  const normalizedName = rawName.toLowerCase();

  if (
    ["BANH-NGOT", ...CAKE_TYPE_IDS].includes(rawId) ||
    normalizedName === "bánh ngọt"
  ) {
    return {
      id: CAKE_TYPE_IDS.includes(rawId) ? rawId : CAKE_TYPE_IDS[0],
      name: PRODUCT_TYPE_GROUPS["banh-ngot"].label,
    };
  }

  if (
    ["KEO-NGOT", ...CANDY_TYPE_IDS].includes(rawId) ||
    normalizedName === "kẹo ngọt"
  ) {
    return {
      id: CANDY_TYPE_IDS.includes(rawId) ? rawId : CANDY_TYPE_IDS[0],
      name: PRODUCT_TYPE_GROUPS["keo-ngot"].label,
    };
  }

  return type;
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function parseStringList(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseProductType(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function normalizeProductPayload(body, file) {
  const normalizedBody = sanitizeProductBody(body);

  if (file?.filename) {
    normalizedBody.image = `${IMAGE_DIRECTORY_PATH}/${file.filename}`;
  }

  if (normalizedBody.price !== undefined) {
    normalizedBody.price = Number(normalizedBody.price);
  }

  if (normalizedBody.stock !== undefined && normalizedBody.stock !== "") {
    normalizedBody.stock = Number(normalizedBody.stock);
  }

  normalizedBody.tags = parseStringList(normalizedBody.tags) || [];
  normalizedBody.type = normalizeProductType(parseProductType(normalizedBody.type));

  return normalizedBody;
}

function normalizeImagePath(image) {
  if (typeof image === "string") {
    const trimmed = image.trim();

    if (trimmed.startsWith("/images/")) {
      return trimmed;
    }

    if (trimmed.startsWith("images/")) {
      return `/${trimmed}`;
    }

    if (trimmed && !trimmed.includes("/") && !trimmed.includes("\\")) {
      return `/images/${trimmed}`;
    }
  }

  return DEFAULT_IMAGE_PATH;
}

function sanitizeProductBody(body) {
  if (!body || typeof body !== "object") {
    return {};
  }

  const sanitizedBody = { ...body };
  delete sanitizedBody.id;
  delete sanitizedBody._id;

  return sanitizedBody;
}

function mapProductResponse(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    _id: product._id.toString(),
    image: normalizeImagePath(product.image),
  };
}

async function generateNextProductCode() {
  const items = await Product.find(
    { id: { $type: "string", $regex: /^SP\d+$/i } },
    { id: 1 }
  ).lean();

  let maxNumber = 0;

  for (const item of items) {
    const match = String(item?.id || "").match(/^SP(\d+)$/i);

    if (!match) {
      continue;
    }

    const currentNumber = Number(match[1]);

    if (!Number.isNaN(currentNumber) && currentNumber > maxNumber) {
      maxNumber = currentNumber;
    }
  }

  const nextNumber = maxNumber + 1;
  return `SP${String(nextNumber).padStart(3, "0")}`;
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const imagesDir = path.join(publicDir, "images");
ensureDirSync(imagesDir);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imagesDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || ".jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, filename);
  },
});

  const fileFilter = function fileFilter(req, file, cb) {
  if (!file) {
    return cb(null, true);
  }

  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }

  return cb(null, false);
};

const upload = multer({ storage, fileFilter });

app.get("/products", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json([]);
    }

    const filter = buildCategoryFilter(req.query.category);
    const minStock = parseOptionalNumber(req.query.minStock);
    const maxStock = parseOptionalNumber(req.query.maxStock);

    if (minStock !== null || maxStock !== null) {
      filter.stock = {};

      if (minStock !== null && !Number.isNaN(minStock)) {
        filter.stock.$gte = minStock;
      }

      if (maxStock !== null && !Number.isNaN(maxStock)) {
        filter.stock.$lte = maxStock;
      }

      if (Object.keys(filter.stock).length === 0) {
        delete filter.stock;
      }
    }

    const items = await Product.find(filter).lean();
    const mapped = items.map(mapProductResponse);

    return res.json(mapped);
  } catch (err) {
    console.error("Loi GET /products:", err);
    return res.status(500).json([]);
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({});
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      ...mapProductResponse(product),
    });
  } catch (err) {
    console.error("Loi GET /products/:id:", err);
    return res.status(500).json({ message: "Failed to load product" });
  }
});

app.get("/products/category/:categoryId", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json([]);
    }

    const { categoryId } = req.params;
    const items = await Product.find(buildCategoryFilter(categoryId)).lean();
    const mapped = items.map(mapProductResponse);

    return res.json(mapped);
  } catch (err) {
    console.error("Loi GET /products/category/:categoryId:", err);
    return res.status(500).json([]);
  }
});

app.get("/products/search/keyword", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json([]);
    }

    const value = (req.query.value || "").trim();

    if (!value) {
      return res.json([]);
    }

    const normalizedKeyword = normalizeVietnameseText(value);
    const items = await Product.find().lean();
    const filteredItems = items.filter((item) => {
      const searchValues = [
        item.name,
        item.description,
        item.type?.id,
        item.type?.name,
        ...(Array.isArray(item.tags) ? item.tags : []),
      ];

      return searchValues.some((searchValue) =>
        normalizeVietnameseText(searchValue).includes(normalizedKeyword)
      );
    });

    const mapped = filteredItems.map(mapProductResponse);

    return res.json(mapped);
  } catch (err) {
    console.error("Loi GET /products/search/keyword:", err);
    return res.status(500).json([]);
  }
});

app.get("/api/products", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    const q = (req.query.q || "").trim();
    const filter = {};

    if (q) {
      const pattern = new RegExp(escapeRegExp(q), "i");
      filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const items = await Product.find(filter).lean();
    const mapped = items.map(mapProductResponse);

    return res.json(mapped);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({});
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      ...mapProductResponse(product),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load product" });
  }
});

app.post("/api/products", upload.single("imageFile"), async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not connected" });
    }

    if (req.file && req.file.filename) {
      req.body.image = `/images/${req.file.filename}`;
    }

    const body = normalizeProductPayload(req.body, req.file);

    body.id = await generateNextProductCode();

    const created = await Product.create(body);
    const object = created.toObject();

    return res.status(201).json({
      ...mapProductResponse(object),
    });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Failed to create product" });
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

    const body = normalizeProductPayload(req.body, req.file);

    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    const object = updated.toObject ? updated.toObject() : updated;

    return res.json({
      ...mapProductResponse(object),
    });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Failed to update product" });
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

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

connectMongo()
  .then(() => {
    if (!isMongoConnected()) {
      console.log("MongoDB not connected yet");
    }
  })
  .finally(() => {
    app.listen(5000, "0.0.0.0", () => {
      console.log("Server running on http://localhost:5000");
    });
  });
