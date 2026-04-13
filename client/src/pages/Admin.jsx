import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddProductAdmin from "../components/AddProductAdmin";
import DeleteProductAdmin from "../components/DeleteProductAdmin";
import UpdateProductAdmin from "../components/UpdateProductAdmin";
import { API_BASE_URL } from "../utils/api";

function Admin() {
  const { mode: routeMode } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(routeMode || "add");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setMode(routeMode || "add");
  }, [routeMode]);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi fetch API:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <button className="back-button" onClick={() => navigate("/")}>
        Quay lại
      </button>

      <h1>Quản lý sản phẩm</h1>

      <div className="admin-container">
        {mode === "add" && (
          <AddProductAdmin
            onProductAdded={loadProducts}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {mode === "update" && (
          <UpdateProductAdmin
            products={products}
            onProductUpdated={loadProducts}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {mode === "delete" && (
          <DeleteProductAdmin
            products={products}
            onProductDeleted={loadProducts}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}

export default Admin;
