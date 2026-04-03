import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const API_BASE = "http://localhost:5000";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter theo category hoặc tag khi URL params thay đổi
  useEffect(() => {
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    
    if (products.length === 0) return;

    if (tag) {
      filterByTag(tag);
    } else if (category) {
      filterByCategory(category);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      console.log(" API Response - Full product structure:", data[0]); // Log sản phẩm đầu tiên
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
    } finally {
      setLoading(false);
    }
  }

  function filterByTag(tag) {
    const filtered = products.filter((product) => {
      const tags = (product.tags || []).map(t => t.toLowerCase());
      return tags.includes(tag.toLowerCase());
    });
    setFilteredProducts(filtered);
  }

  function filterByCategory(category) {
    console.log("Filtering by category:", category);
    console.log("All products:", products);
    
    let filtered = [...products];

    if (category === "bánh-ngọt") {
      // Filter by type (category name), không phải tags
      filtered = filtered.filter((product) => {
        const typeName = (product.type?.name || "").toLowerCase();
        console.log(`Product: ${product.name}, Type: ${typeName}`);
        return typeName.includes("bánh");
      });
    } else if (category === "kẹo-snack") {  // FIX: match với Sidebar param
      // Filter by type (category name)
      filtered = filtered.filter((product) => {
        const typeName = (product.type?.name || "").toLowerCase();
        console.log(`Product: ${product.name}, Type: ${typeName}`);
        return typeName.includes("kẹo") || typeName.includes("snack");
      });
    }

    console.log("Filtered results:", filtered.length, "products");
    setFilteredProducts(filtered);
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

  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const categoryTitle = 
    tag ? `Sản phẩm với tag: ${tag}` :
    category === "bánh-ngọt" ? "Bánh ngọt" :
    category === "kẹo-snack" ? "Kẹo ngọt" :
    "Sản phẩm của chúng tôi";

  return (
    <div className="products-page">
      <h1>{categoryTitle}</h1>
      {tag && (
        <button 
          className="clear-filter-btn"
          onClick={() => navigate("/products")}
          style={{
            marginBottom: "15px",
            padding: "8px 16px",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          X Xóa bộ lọc
        </button>
      )}

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
                      <span 
                        key={i} 
                        className="tag"
                        onClick={() => navigate(`/products?tag=${tag}`)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: "#667eea",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          transition: "background-color 0.3s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#764ba2"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#667eea"}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="view-detail-btn"
                  onClick={() => navigate(`/detail/${product.id}`)}
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
