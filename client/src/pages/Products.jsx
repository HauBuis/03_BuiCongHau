import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../components/ProductList";
import SearchBar from "../components/SearchBar";
import { API_BASE_URL } from "../utils/api";
import { getCategoryLabel } from "../utils/categories";

function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category");
  const keyword = searchParams.get("value") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const isKeywordSearch = location.pathname === "/products/search/keyword";
  const isPriceSearch = Boolean(minPrice || maxPrice);

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

  function handleSearch(searchData) {
    if (searchData.type === "reset") {
      navigate("/products");
      return;
    }

    if (searchData.type === "keyword") {
      if (!searchData.value) {
        navigate("/products");
        return;
      }

      navigate(
        `/products/search/keyword?value=${encodeURIComponent(searchData.value)}`
      );
      return;
    }

    if (searchData.type === "price") {
      const params = new URLSearchParams();

      if (searchData.minPrice !== "") {
        params.set("minPrice", searchData.minPrice);
      }

      if (searchData.maxPrice !== "") {
        params.set("maxPrice", searchData.maxPrice);
      }

      navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }

  function getPageTitle() {
    if (isKeywordSearch) {
      return keyword
        ? `Kết quả tìm kiếm: ${keyword}`
        : "Tìm kiếm sản phẩm";
    }

    if (isPriceSearch) {
      if (minPrice && maxPrice) {
        return `Sản phẩm từ ${Number(minPrice).toLocaleString("vi-VN")} đến ${Number(
          maxPrice
        ).toLocaleString("vi-VN")} VND`;
      }

      if (minPrice) {
        return `Sản phẩm từ ${Number(minPrice).toLocaleString("vi-VN")} VND`;
      }

      return `Sản phẩm đến ${Number(maxPrice).toLocaleString("vi-VN")} VND`;
    }

    if (category) {
      return `Danh sách ${getCategoryLabel(category)}`;
    }

    return "Danh sách sản phẩm";
  }

  return (
    <div className="products-page">
      <h1>{getPageTitle()}</h1>
      <SearchBar
        initialKeyword={keyword}
        initialMinPrice={minPrice}
        initialMaxPrice={maxPrice}
        onSearch={handleSearch}
      />

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}

export default Products;
