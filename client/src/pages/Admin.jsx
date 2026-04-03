import React, { useEffect, useState } from "react";

function Admin({ onNavigate, mode: modeProp }) {
  const API_BASE = "http://localhost:5000";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(modeProp || "add");
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setMode(modeProp || "add");
    setSelectedProduct(null);
    setFormData((prev) => ({ ...prev, status: "" }));
  }, [modeProp]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    if (!formData.name.trim() || formData.price === "") {
      alert("Vui lòng nhập tên và giá");
      return;
    }

    try {
      setLoading(true);
      const fData = new FormData();
      fData.append("name", formData.name);
      fData.append("price", formData.price);
      fData.append("description", formData.description);
      fData.append("stock", formData.stock === "" ? "0" : formData.stock);
      fData.append("tags", formData.tags);
      fData.append("events", formData.events);

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
        events: "",
        imageFile: null,
      });
      await loadProducts();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Xóa sản phẩm này?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Xóa sản phẩm thất bại");
      }

      alert("Xóa sản phẩm thành công");
      await loadProducts();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const startEditProduct = (product) => {
    setMode("update");
    setSelectedProduct(product);

    setFormData({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      category: product.type?.name || "",
      stock: product.stock || "",
      tags: (product.tags || []).join(", "),
      events: (product.events || []).join(", "),
      imageFile: null,
    });
  };

  async function handleUpdateProduct(e) {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Chưa chọn sản phẩm để cập nhật.");
      return;
    }

    if (!formData.name.trim() || formData.price === "") {
      alert("Vui lòng nhập tên và giá");
      return;
    }

    try {
      setLoading(true);
      const fData = new FormData();
      fData.append("name", formData.name);
      fData.append("price", formData.price);
      fData.append("description", formData.description);
      fData.append("stock", formData.stock === "" ? "0" : formData.stock);
      fData.append("tags", formData.tags);
      fData.append("events", formData.events);
      fData.append("type", JSON.stringify({ name: formData.category }));

      if (formData.imageFile) {
        fData.append("imageFile", formData.imageFile);
      }

      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}`, {
        method: "PUT",
        body: fData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật sản phẩm thất bại");
      }

      alert("Cập nhật sản phẩm thành công");
      setSelectedProduct(null);
      setMode("add");
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
      await loadProducts();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <button
        className="back-button"
        onClick={() => onNavigate("home")}
      >
        ← Quay lại
      </button>

      <h1>Quản lý sản phẩm</h1>

      <div className="admin-container">
        <section className="admin-form-section">
          <h2>{mode === "update" ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>

          {mode === "delete" ? (
            <p>Đang ở chế độ xóa, vui lòng chọn nút xóa trong danh sách.</p>
          ) : mode === "update" && !selectedProduct ? (
            <p>Vui lòng chọn sản phẩm cần cập nhật từ danh sách bên dưới.</p>
          ) : (
            <form
              onSubmit={mode === "update" ? handleUpdateProduct : handleAddProduct}
              className="admin-form"
            >
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
                <label>Loại sản phẩm (category)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="VD: Bánh ngọt, Kẹo"
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading
                  ? "Đang xử lý..."
                  : mode === "update"
                  ? "Cập nhật sản phẩm"
                  : "Thêm sản phẩm"}
              </button>
            </form>
          )}
        </section>

        {/* Danh sách sản phẩm */}
        <section className="admin-list-section">
          <h2>Danh sách sản phẩm</h2>
          {loading ? (
            <p className="loading">Đang tải...</p>
          ) : products.length === 0 ? (
            <p className="no-products">Không có sản phẩm</p>
          ) : (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Tags</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{Number(product.price).toLocaleString("vi-VN")} VNĐ</td>
                      <td>{product.stock}</td>
                      <td>
                        {product.tags && product.tags.length > 0
                          ? product.tags.join(", ")
                          : "-"}
                      </td>
                      <td>
                        {mode !== "delete" && (
                          <button
                            className="submit-btn"
                            onClick={() => startEditProduct(product)}
                          >
                            Sửa
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Admin;
