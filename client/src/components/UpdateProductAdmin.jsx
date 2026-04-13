import React, { useState } from "react";
import { API_BASE_URL } from "../utils/api";
import { PRODUCT_CATEGORIES } from "../utils/categories";

function UpdateProductAdmin({
  products,
  onProductUpdated,
  loading,
  setLoading,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  function startEditProduct(product) {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      category: product.type?.id || "",
      stock: product.stock || "",
      tags: (product.tags || []).join(", "),
      events: (product.events || []).join(", "),
      imageFile: null,
    });
    setImagePreview(null);
  }

  async function handleUpdateProduct(event) {
    event.preventDefault();

    if (!selectedProduct) {
      alert("Chưa chọn sản phẩm để cập nhật.");
      return;
    }

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

      const response = await fetch(
        `${API_BASE_URL}/api/products/${selectedProduct.id}`,
        {
          method: "PUT",
          body: requestData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Cập nhật sản phẩm thất bại.");
      }

      alert("Cập nhật sản phẩm thành công.");
      setSelectedProduct(null);
      setImagePreview(null);
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
      onProductUpdated();
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
      <h2>Cập nhật sản phẩm</h2>

      {!selectedProduct ? (
        <p>Vui lòng chọn sản phẩm cần cập nhật trong danh sách bên dưới.</p>
      ) : (
        <form onSubmit={handleUpdateProduct} className="admin-form">
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
            {loading ? "Đang xử lý..." : "Cập nhật sản phẩm"}
          </button>
        </form>
      )}

      <h3 style={{ marginTop: "30px" }}>Danh sách sản phẩm</h3>
      {products.length === 0 ? (
        <p className="no-products">Không có sản phẩm.</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Loại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{
                    backgroundColor:
                      selectedProduct?.id === product.id
                        ? "rgba(102, 126, 234, 0.1)"
                        : "transparent",
                  }}
                >
                  <td>{product.name}</td>
                  <td>{Number(product.price).toLocaleString("vi-VN")} VND</td>
                  <td>{product.stock}</td>
                  <td>{product.type?.name || "-"}</td>
                  <td>
                    <button
                      className="submit-btn"
                      type="button"
                      onClick={() => startEditProduct(product)}
                    >
                      Chọn để sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default UpdateProductAdmin;
