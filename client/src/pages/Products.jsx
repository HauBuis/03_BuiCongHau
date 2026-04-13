import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductList from "../components/ProductList";
import { API_BASE_URL } from "../utils/api";
import { getCategoryLabel } from "../utils/categories";

function Products() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = new URLSearchParams(location.search).get("category");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}${location.pathname}${location.search}`
        );
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [location.pathname, location.search]);

  return (
    <div className="products-page">
      <h1>
        {category
          ? `Danh sách ${getCategoryLabel(category)}`
          : "Danh sách sản phẩm"}
      </h1>
      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}

export default Products;
