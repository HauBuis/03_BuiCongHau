import React, { useState } from "react";
import { API_BASE_URL } from "../utils/api";
import { PRODUCT_CATEGORIES } from "../utils/categories";

function AddProductAdmin({ onProductAdded, loading, setLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    tags: "",
    events: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  async function handleAddProduct(event) {
    event.preventDefault();

    if (!formData.name.trim() || formData.price === "") {
      alert("Vui lòng nhập tên và giá.");
      return;
    }

    if (formData.stock === "") {
      alert("Vui lòng nhập tồn kho.");
      return;
    }

    if (!formData.category) {
      alert("Vui lòng chọn loại sản phẩm.");
      return;
    }

    try {
      setLoading(true);

      const selectedCategory = PRODUCT_CATEGORIES.find(
        (item) => item.value === formData.category
      );

      const requestData = new FormData();
      requestData.append("name", formData.name);
      requestData.append("price", formData.price);
      requestData.append("description", formData.description);
      requestData.append("stock", formData.stock);
      requestData.append(
        "tags",
        formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(",")
      );
      requestData.append(
        "events",
        formData.events
          .split(",")
          .map((event) => event.trim())
          .filter(Boolean)
          .join(",")
      );
      requestData.append(
        "type",
        JSON.stringify({
          id: formData.category,
          name: selectedCategory ? selectedCategory.label : "",
        })
      );

      if (formData.imageFile) {
        requestData.append("imageFile", formData.imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        body: requestData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Tạo sản phẩm thất bại.");
      }

      alert("Thêm sản phẩm thành công.");
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        tags: "",
        events: "",
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

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData({ ...formData, imageFile: null });
      setImagePreview(null);
      return;
    }

    setFormData({ ...formData, imageFile: file });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <section className="admin-form-section">
      <h2>Thêm sản phẩm mới</h2>

      <form onSubmit={handleAddProduct} className="admin-form">
        <div className="form-group">
          <label>Tên sản phẩm *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(event) =>
              setFormData({ ...formData, description: event.target.value })
            }
            placeholder="Nhập mô tả sản phẩm"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Giá (VND) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(event) =>
              setFormData({ ...formData, price: event.target.value })
            }
            placeholder="Nhập giá"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Tồn kho *</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(event) =>
              setFormData({ ...formData, stock: event.target.value })
            }
            placeholder="Nhập số lượng tồn kho"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Loại sản phẩm *</label>
          <select
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
            required
          >
            <option value="">Chọn loại sản phẩm</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(event) =>
              setFormData({ ...formData, tags: event.target.value })
            }
            placeholder="Ví dụ: sinh nhật, tặng quà"
          />
        </div>

        <div className="form-group">
          <label>Sự kiện</label>
          <input
            type="text"
            value={formData.events}
            onChange={(event) =>
              setFormData({ ...formData, events: event.target.value })
            }
            placeholder="Ví dụ: sinh nhật, kỷ niệm"
          />
        </div>

        <div className="form-group">
          <label>Hình ảnh</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
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
