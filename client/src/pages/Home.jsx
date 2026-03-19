import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProductList from "../components/ProductList";

function Home() {
  const [products, setProducts] = useState([]);
  const API_BASE = "http://localhost:5000";

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    imageFile: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || newProduct.price === "") {
      alert("Vui lòng nhập đủ `name` và `price`.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description || "");
      formData.append("stock", newProduct.stock === "" ? "0" : String(newProduct.stock));
      if (newProduct.imageFile) {
        formData.append("imageFile", newProduct.imageFile);
      }

      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      setNewProduct({
        name: "",
        price: "",
        description: "",
        stock: "",
        imageFile: null,
      });
      await loadProducts();
    } catch (err) {
      alert(`Tạo sản phẩm thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id, updates) {
    if (!id) return;
    try {
      setLoading(true);
      const isFormData = typeof FormData !== "undefined" && updates instanceof FormData;

      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? updates : JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      await loadProducts();
    } catch (err) {
      alert(`Cập nhật thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      await loadProducts();
    } catch (err) {
      alert(`Xóa thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="product-area">
          <form className="crud-form" onSubmit={handleCreate}>
            <h2>CRUD Products</h2>

            <div className="crud-form-grid">
              <input
                className="crud-input"
                placeholder="Tên sản phẩm"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                className="crud-input"
                type="number"
                placeholder="Giá"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <input
                className="crud-input"
                type="number"
                placeholder="Tồn kho"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
              <input
                className="crud-input"
                placeholder="Mô tả"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <input
                className="crud-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setNewProduct({ ...newProduct, imageFile: file });
                }}
              />
            </div>

            <button className="crud-button" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
            </button>
          </form>

          <ProductList products={products} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

export default Home;