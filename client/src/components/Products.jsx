import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

function Products({ onNavigate }) {
  const API_BASE = "http://localhost:5000";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(searchParams) {
    if (searchParams.type === "reset") {
      setFilteredProducts(products);
      return;
    }

    let filtered = [...products];

    if (searchParams.type === "keyword") {
      const keyword = searchParams.value.toLowerCase();
      filtered = filtered.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const tags = (product.tags || []).join(" ").toLowerCase();
        return (
          name.includes(keyword) ||
          description.includes(keyword) ||
          tags.includes(keyword)
        );
      });
    } else if (searchParams.type === "price") {
      filtered = filtered.filter((product) => {
        const price = Number(product.price);
        return (
          price >= searchParams.minPrice && price <= searchParams.maxPrice
        );
      });
    }

    setFilteredProducts(filtered);
  }

  if (loading) {
    return <div className="loading">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="products-page">
      <h1>Sản phẩm của chúng tôi</h1>

      <SearchBar onSearch={handleSearch} />

      <div className="products-container">
        {filteredProducts.length === 0 ? (
          <p className="no-products">Không tìm thấy sản phẩm phù hợp</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                  className="product-image-thumbnail"
                />
                <h3>{product.name}</h3>
                <p className="product-price">
                  {Number(product.price).toLocaleString("vi-VN")} VNĐ
                </p>
                <p className="product-stock">
                  Tồn kho: {product.stock}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="product-tags">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="view-detail-btn"
                  onClick={() => onNavigate("detail", product.id)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
