# VLU - HK252 - Chuyên Đề Web

## Mô tả dự án
Dự án demo shop hoa gồm:
- **Frontend**: React (CRA) hiển thị danh sách sản phẩm và cung cấp giao diện **CRUD** ngay trên trang.
- **Backend**: Express.js + **Mongoose** kết nối **MongoDB**, cung cấp REST API cho `products`.
- **Upload ảnh**: sử dụng **multer**, lưu ảnh vào `server/public/images/` và serve tĩnh tại đường dẫn `/images/...`.

Các thao tác CRUD (Thêm / Sửa / Xóa) hoạt động thông qua API:
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Yêu cầu
- Node.js
- MongoDB (local hoặc Atlas) và cấu hình `MONGODB_URI`

## Cài đặt toàn bộ dự án

### Chuẩn bị
- Đảm bảo bạn đã cài **Node.js**.
- Đảm bảo **MongoDB** đang chạy hoặc bạn có thể truy cập MongoDB Atlas qua `MONGODB_URI`.

### Bước 1: Cài dependencies
Mở terminal ở thư mục gốc `03_BuiCongHau`, sau đó:

```bash
# backend
cd server
npm install

# frontend
cd ../client
npm install
```

Thư viện chính sẽ được cài tự động theo `package.json`:
- `server/`: `express`, `cors`, `mongoose`, `dotenv`, `multer`, `nodemon`
- `client/`: `react`, `react-dom`, `react-scripts` và các thư viện test đi kèm


### Bước 2: Cấu hình `.env` cho backend
Tạo file `server/.env` với nội dung:

```env
MONGODB_URI="mongodb://USER:PASSWORD@HOST:PORT/DBNAME"
```

Lưu ý:
- Không commit thông tin nhạy cảm ra git.
- `MONGODB_URI` có thể là local hoặc MongoDB Atlas.

### Bước 3: Khởi chạy 2 phần
Bạn chạy backend và frontend bằng 2 terminal khác nhau (hoặc tab terminal khác nhau).

## Cách chạy dự án

### 1) Chạy backend
```bash
cd server
npm install
npm run dev
```
Backend mặc định chạy tại:
- `http://localhost:5000`

### 2) Chạy frontend
```bash
cd client
npm install
npm start
```
Frontend mặc định chạy tại:
- `http://localhost:3000`

## Upload ảnh hoạt động như thế nào?
- Server lưu file upload vào: `server/public/images/`
- Ảnh trả về và hiển thị với đường dẫn:
  - `"/images/<ten-file>"`
- Field upload trên API:
  - `imageFile` (multipart form-data)
- Loại file được chấp nhận: `jpg/jpeg/png/webp/gif` (dựa theo `mimetype`).

## MongoDB / Mongoose schema: `products`
Schema được định nghĩa trong:
- `server/data/products.js`

Model:
- `Product` (collection: `products`)

Các field:
- `name` (String, required)
- `price` (Number, required, min: 0)
- `description` (String)
- `category` (String) *(frontend hiện không dùng nhưng vẫn có trong schema)*
- `stock` (Number, min: 0, default: 0)
- `image` (String, default: `"/images/hoa1.jpg"`)
- `createdAt`, `updatedAt` (timestamps)

## API CRUD (REST)

### 1) `GET /api/products`
- Response: mảng sản phẩm
- Mỗi item có thêm:
  - `id` (chuỗi từ `_id`) để frontend dễ dùng
  - `image` đã được chuẩn hóa về dạng `"/images/..."`.
-
Hỗ trợ tìm kiếm:
- `GET /api/products?q=<keyword>`
- Tìm theo `name` hoặc `description` (không phân biệt hoa/thường).

### 2) `POST /api/products`
- Content-Type: `multipart/form-data`
- Fields:
  - `name` (bắt buộc)
  - `price` (bắt buộc)
  - `description` (tuỳ chọn)
  - `stock` (tuỳ chọn)
  - `imageFile` (tuỳ chọn)

Nếu upload có file `imageFile`:
- Server tự đặt `body.image = "/images/<filename>"`.

### 3) `PUT /api/products/:id`
- Content-Type: `multipart/form-data`
- `:id` là MongoDB `_id`
- Fields có thể cập nhật:
  - `name`, `price`, `description`, `stock`
  - `imageFile` (tuỳ chọn, nếu gửi thì đổi ảnh)

### 4) `DELETE /api/products/:id`
- Content-Type: bất kỳ (không cần body)
- Xóa theo `_id`
- Response:
  - `204 No Content` nếu thành công

## Frontend CRUD
Các thao tác trên trang `Home`:
- Tìm kiếm:
  - ô nhập keyword (tìm theo tên hoặc mô tả)
  - nút `Tìm kiếm` gọi `GET /api/products?q=...`
  - nút `Xóa tìm` quay về `GET /api/products`
- Form **Thêm sản phẩm**:
  - nhập `name`, `price`, `description`, `stock`
  - chọn file ảnh (upload)
  - bấm **Thêm sản phẩm** để gọi `POST /api/products`
- Mỗi card có:
  - nút **Sửa**: mở form inline để cập nhật
  - nút **Xóa**: gọi `DELETE /api/products/:id`

Code quan trọng:
- `client/src/pages/Home.jsx`
- `client/src/components/ProductList.jsx`
- `client/src/components/ProductCard.jsx`

## Troubleshooting nhanh
- Nếu `GET /api/products` trả về rỗng:
  - DB có thể chưa có dữ liệu (bạn hãy dùng form “Thêm sản phẩm” để tạo).
- Nếu upload ảnh không ra ảnh:
  - kiểm tra file đã được upload vào `server/public/images/`
  - kiểm tra đường dẫn `product.image` trong response có dạng `"/images/..."` hay không.

## Tài liệu chi tiết code
Xem thêm:
- `CODE_WALKTHROUGH.md`

