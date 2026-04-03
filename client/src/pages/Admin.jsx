import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddProductAdmin from "../components/AddProductAdmin";
import UpdateProductAdmin from "../components/UpdateProductAdmin";
import DeleteProductAdmin from "../components/DeleteProductAdmin";

function Admin() {
  const { mode: modeProp } = useParams();
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(modeProp || "add");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setMode(modeProp || "add");
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

  return (
    <div className="admin-page">
      <button className="back-button" onClick={() => navigate("/")}>
        < Quay lại
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
