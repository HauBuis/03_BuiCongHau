import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProductList from "../components/ProductList";

function Home() {
  const API_BASE = "http://localhost:5000";

  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    imageFile: null,
  });

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
      alert("Vui lòng nhập đủ tên và giá.");
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

      const isFormData = updates instanceof FormData;

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
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "DELETE",
      });

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

  const filteredProducts = products.filter((product) => {
    const name = product.name ? product.name.toLowerCase() : "";
    const description = product.description ? product.description.toLowerCase() : "";
    const searchText = keyword.toLowerCase();

    const matchKeyword =
      name.includes(searchText) || description.includes(searchText);

    let matchStock = true;

    if (stockFilter === "inStock") {
      matchStock = Number(product.stock) > 0;
    } else if (stockFilter === "outOfStock") {
      matchStock = Number(product.stock) === 0;
    }

    return matchKeyword && matchStock;
  });

  return (
    <div className="container">
      <Header />

      <div className="main-content">
        <Sidebar />

        <div className="product-area">
          {/* Filter đơn giản */}
          <div className="search-form">
            <input
              className="crud-input"
              type="text"
              placeholder="Filter by keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <select
              className="crud-input"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">Tất cả sản phẩm</option>
              <option value="inStock">Còn hàng</option>
              <option value="outOfStock">Hết hàng</option>
            </select>

            <button
              className="crud-button crud-button-secondary"
              type="button"
              onClick={() => {
                setKeyword("");
                setStockFilter("all");
              }}
            >
              Xóa filter
            </button>
          </div>

          {/* Thêm sản phẩm */}
          <form className="crud-form" onSubmit={handleCreate}>
            <h2>Thêm sản phẩm</h2>

            <div className="crud-form-grid">
              <input
                className="crud-input"
                placeholder="Tên sản phẩm"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />

              <input
                className="crud-input"
                type="number"
                placeholder="Giá"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />

              <input
                className="crud-input"
                type="number"
                placeholder="Tồn kho"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />

              <input
                className="crud-input"
                placeholder="Mô tả"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />

              <div className="full-width">
              <input
                className="crud-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewProduct({ ...newProduct, imageFile: file });
                }}
              />
            </div>
            </div>

            <button className="crud-button" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
            </button>
          </form>

          {/* Danh sách sản phẩm */}
          <ProductList
            products={filteredProducts}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;