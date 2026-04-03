import React, { useState } from "react";

function AddProductAdmin({ onProductAdded, loading, setLoading }) {
  const API_BASE = "http://localhost:5000";
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    tags: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  async function handleAddProduct(e) {
    e.preventDefault();

    if (!formData.name.trim() || formData.price === "") {
      alert("Vui lòng nhập tên và giá");
      return;
    }

    if (formData.stock === "") {
      alert("Vui lòng nhập tồn kho");
      return;
    }

    try {
      setLoading(true);
      const fData = new FormData();
      fData.append("name", formData.name);
      fData.append("price", formData.price);
      fData.append("description", formData.description);
      fData.append("stock", formData.stock);
      
      // Xử lý tags: phân tách theo dấu phẩy và trim khoảng trắng
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      fData.append("tags", JSON.stringify(tagsArray));
      
      // Gửi type (category)
      fData.append("type", JSON.stringify({ name: formData.category }));
      
      // Loại bỏ events - không cần gửi

      if (formData.imageFile) {
        fData.append("imageFile", formData.imageFile);
      }

      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        body: fData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Tạo sản phẩm thất bại");
      }

      alert("Thêm sản phẩm thành công");
      setFormData({
        name: "",
        price: "",
        description: "",
        stock: "",
        tags: "",
        category: "",
        imageFile: null,
      });
      setImagePreview(null);
      onProductAdded();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="admin-form-section">
      <h2>Thêm sản phẩm mới</h2>

      <form onSubmit={handleAddProduct} className="admin-form">
        <div className="form-group">
          <label>Tên sản phẩm *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Nhập mô tả sản phẩm"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Giá (VNĐ) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="Nhập giá"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Tồn kho (Số lượng) *</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            placeholder="Nhập số lượng tồn kho"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Loại sản phẩm (Category)</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="VD: Bánh ngọt, Kẹo & Snack ngọt"
          />
        </div>

        <div className="form-group">
          <label>Tags (Nhãn)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            placeholder="VD: tiệc thiếu nhi, dã ngoại, phần thưởng học sinh (cách nhau bằng dấu phẩy)"
          />
        </div>

        <div className="form-group">
          <label>Hình ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  objectFit: "cover",
                }}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
        </button>
      </form>
    </section>
  );
}

export default AddProductAdmin;
