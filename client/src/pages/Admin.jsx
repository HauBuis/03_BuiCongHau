import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImportProductsAdmin from "../components/ImportProductsAdmin";
import ProductManagementAdmin from "../components/ProductManagementAdmin";
import { API_BASE_URL } from "../components/productShared";

const DEFAULT_MODE = "add";

function Admin() {
  const { mode: routeMode } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const mode = routeMode || DEFAULT_MODE;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function renderAdminSection() {
    const sharedProps = {
      loading,
      setLoading,
    };

    switch (mode) {
      case "update":
      case "delete":
      case "add":
        return (
          <ProductManagementAdmin
            {...sharedProps}
            mode={mode}
            products={products}
            onProductAdded={loadProducts}
            onProductUpdated={loadProducts}
            onProductDeleted={loadProducts}
          />
        );
      case "import":
        return (
          <ImportProductsAdmin
            {...sharedProps}
            onProductsImported={loadProducts}
          />
        );
      default:
        return (
          <ProductManagementAdmin
            {...sharedProps}
            mode="add"
            products={products}
            onProductAdded={loadProducts}
            onProductUpdated={loadProducts}
            onProductDeleted={loadProducts}
          />
        );
    }
  }

  return (
    <div className="admin-page">
      <button className="back-button" onClick={() => navigate("/")}>
        Quay lại
      </button>

      <h1>Quản lý sản phẩm</h1>

      <div className="admin-container">{renderAdminSection()}</div>
    </div>
  );
}

export default Admin;
