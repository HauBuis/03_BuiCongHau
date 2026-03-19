# CODE_WALKTHROUGH.md (Client - Server - MongoDB - Mongoose)

Tài liệu này giải thích chi tiết cách code hoạt động từ **Client (React)** đến **Server (Express + Mongoose + MongoDB)**, bao gồm luồng CRUD và upload ảnh.

## 1) Tổng quan kiến trúc luồng request

### Luồng “đọc danh sách sản phẩm”
1. `Home.jsx` gọi `GET http://localhost:5000/api/products`
2. `server/server.js`:
   - kiểm tra kết nối MongoDB
   - `Product.find({}).lean()`
   - map thêm `id` và chuẩn hoá `image`
3. React nhận JSON và render `ProductCard`.

Ngoài ra endpoint `GET /api/products` hỗ trợ tìm kiếm:
- `GET /api/products?q=<keyword>`
- filter theo `name` hoặc `description` bằng regex case-insensitive

### Luồng “thêm / cập nhật sản phẩm” (có upload ảnh)
1. React dùng `FormData` và gửi `multipart/form-data` tới:
   - `POST /api/products`
   - `PUT /api/products/:id`
2. `server/server.js` dùng `multer`:
   - `upload.single("imageFile")`
   - lưu file vào `server/public/images/`
3. Server:
   - nếu có file upload, đặt `body.image = /images/<filename>`
   - chuyển sang Mongoose để `create` hoặc `findByIdAndUpdate`
4. Server trả JSON:
   - thêm `id` (string từ `_id`)
   - chuẩn hoá `image` về dạng `/images/...`

### Luồng “xóa sản phẩm”
1. React gọi `DELETE /api/products/:id`
2. Server:
   - validate `ObjectId`
   - `Product.findByIdAndDelete(id)`
3. Server trả `204 No Content`
4. React load lại danh sách.

## 2) Code phía Server

### 2.1) File chính: `server/server.js`

#### (a) Load cấu hình `.env`
Server dùng:
- `dotenv.config({ path: path.join(__dirname, ".env") })`

Sau đó trong `connectMongo()` dùng `process.env.MONGODB_URI`.
Server cũng có log:
- `MONGODB_URI loaded from .env: yes/no`

> Mục tiêu: chắc chắn server đã đọc đúng cấu hình trước khi connect.

#### (b) Khởi tạo Express middleware
- `app.use(cors())`: cho phép call từ frontend ở port khác.
- `app.use(express.json())`: hỗ trợ JSON body (trường hợp không phải multipart).
- `app.use(express.static("public"))`:
  - server serve file tĩnh ở thư mục `server/public`
  - nên ảnh truy cập qua `http://localhost:5000/images/<filename>`.

#### (c) Kết nối MongoDB bằng Mongoose
`connectMongo()`:
- `await mongoose.connect(mongoURI)`
- log `MongoDB connected` nếu thành công.

`isMongoConnected()`:
- kiểm tra `mongoose.connection.readyState === 1` để biết MongoDB đã sẵn sàng.

#### (d) Chuẩn hoá đường dẫn ảnh
`normalizeImagePath(image)` đảm bảo client luôn nhận dạng:
- `"/images/..."`.

Nếu dữ liệu cũ (hoặc không hợp lệ) thì default về:
- `"/images/hoa1.jpg"`.

#### (e) Multer upload ảnh
Server tạo thư mục lưu ảnh:
- `server/public/images/` (tự tạo nếu chưa tồn tại)

`multer.diskStorage`:
- `destination`: luôn ghi vào `.../public/images`
- `filename`: đặt tên theo timestamp + random + extension

`fileFilter`:
- chỉ chấp nhận một số `mimetype` phổ biến của ảnh.

Tạo middleware:
- `const upload = multer({ storage, fileFilter })`

#### (f) Routing CRUD

##### `GET /api/products`
Mấu chốt:
- `Product.find({}).lean()`: trả object “plain” để nhanh hơn so với Mongoose document.
- map sang response:
  - `id: _id.toString()`
  - `image: normalizeImagePath(p.image)`

Tìm kiếm:
- Nhận query param `q`
- Lọc theo `name` hoặc `description` (regex i)

##### `POST /api/products`
Middleware:
- `upload.single("imageFile")`

Logic:
- nếu `req.file` có tồn tại:
  - set `req.body.image = "/images/<filename>"`
- parse kiểu dữ liệu:
  - `price` -> `Number`
  - `stock` -> `Number`
- `await Product.create(body)`
- trả response:
  - thêm `id`
  - chuẩn hoá `image`

##### `PUT /api/products/:id`
Middleware:
- `upload.single("imageFile")`

Logic:
- validate `id` có phải ObjectId hợp lệ không
- nếu upload có file mới:
  - set `req.body.image` tương ứng
- `findByIdAndUpdate(id, body, { new: true, runValidators: true })`
- trả updated document + chuẩn hoá `image`

##### `DELETE /api/products/:id`
Logic:
- validate `id`
- `findByIdAndDelete`
- nếu tìm không thấy -> `404`
- thành công -> `204`

### 2.2) Schema model: `server/data/products.js`

File này định nghĩa:
- `ProductSchema` với collection: `products`
- Model name: `Product`

Các field quan trọng:
- `name`: `required: true`
- `price`: `required: true`, `min: 0`
- `stock`: `min: 0`, `default: 0`
- `image`: `default: "/images/hoa1.jpg"`
- `timestamps: true` -> Mongoose tự thêm `createdAt`, `updatedAt`

> Lưu ý: frontend hiện đã bỏ `category`, nhưng schema vẫn có `category` để bạn có thể mở rộng sau.

## 3) Code phía Client (React)

### 3.1) Trang: `client/src/pages/Home.jsx`

State chính:
- `products`: danh sách hiển thị
- `newProduct`: dữ liệu form tạo mới
- `loading`: chặn thao tác khi đang gửi request

Các hàm chính:
- `loadProducts()`:
  - fetch `GET /api/products`
  - setProducts(data)
- `handleCreate(e)`:
  - tạo `FormData`
  - append:
    - `name`, `price`, `description`, `stock`
    - `imageFile` nếu người dùng chọn file
  - gọi `POST /api/products`
  - reset form + load lại danh sách
- `handleUpdate(id, updates)`:
  - nếu có `imageFile`:
    - gửi `FormData` + `imageFile`
  - gọi `PUT /api/products/:id`
  - load lại danh sách
- `handleDelete(id)`:
  - confirm -> gọi `DELETE /api/products/:id`
  - load lại danh sách

### 3.2) Danh sách: `client/src/components/ProductList.jsx`
Chỉ nhận:
- `products`
- `onUpdate`
- `onDelete`

Sau đó map:
- mỗi item render `ProductCard`
- key dùng `product.id || product._id` để tương thích 2 kiểu response.

### 3.3) Card + Form inline: `client/src/components/ProductCard.jsx`

Render:
- ảnh:
  - `src={"http://localhost:5000" + (product.image || defaultImage)}`
- tên + mô tả + giá

Tương tác:
- “Sửa”:
  - bật `isEditing = true`
  - hiển thị form inline (inputs + file upload)
- “Lưu”:
  - tạo `FormData`
  - append các field cần cập nhật
  - nếu có chọn ảnh mới:
    - `formData.append("imageFile", file)`
  - gọi `onUpdate(productId, formData)`
- “Xóa”:
  - gọi `onDelete(productId)`

## 4) MongoDB / Mongoose chi tiết (cần nhớ)

### 4.1) `_id` và `id`
MongoDB lưu khóa chính `_id` kiểu `ObjectId`.
Frontend muốn dùng chuỗi ổn định nên server “map”:
- `_id -> id` bằng `id: _id.toString()`.

### 4.2) `lean()` vs document
Trong `GET /api/products`, dùng `lean()` để giảm chi phí tạo document Mongoose.
JSON trả về sẽ là object thường (tối ưu hơn).

### 4.3) Validation
Schema có `required`, `min`.
Trong `PUT`, server dùng:
- `runValidators: true`
để đảm bảo validate được áp dụng khi cập nhật.

## 5) Ví dụ gọi API (có upload)

### POST sản phẩm (có ảnh)
```bash
curl -X POST http://localhost:5000/api/products \
  -F "name=Hoa Test" \
  -F "price=123000" \
  -F "description=Mo ta test" \
  -F "stock=10" \
  -F "imageFile=@C:/duong-dan/hoa.jpg"
```

### PUT cập nhật (đổi ảnh)
```bash
curl -X PUT http://localhost:5000/api/products/<id> \
  -F "price=200000" \
  -F "imageFile=@C:/duong-dan/hoa-moi.jpg"
```

### DELETE
```bash
curl -X DELETE http://localhost:5000/api/products/<id>
```

## 6) Ghi chú mở rộng
Hiện tại frontend CRUD tập trung vào các field: `name`, `price`, `description`, `stock`, và upload ảnh (`imageFile`).

Nếu bạn muốn mở rộng thêm:
- Thêm filter theo `category` (schema vẫn có `category`)
- Hoặc thêm filter theo `price/stock`

