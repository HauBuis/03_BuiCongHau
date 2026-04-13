import React from "react";
import { API_BASE_URL } from "../utils/api";

function DeleteProductAdmin({
  products,
  onProductDeleted,
  loading,
  setLoading,
}) {
  async function handleDeleteProduct(id) {
    if (!window.confirm("Xóa sản phẩm này?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Xóa sản phẩm thất bại.");
      }

      alert("Xóa sản phẩm thành công.");
      onProductDeleted();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-form-section">
      <h2>Xóa sản phẩm</h2>
      <p>Hãy nhấn nút xóa trong danh sách sản phẩm bên dưới.</p>

      <div style={{ marginTop: "30px" }}>
        <h3>Danh sách sản phẩm</h3>
        {products.length === 0 ? (
          <p className="no-products">Không có sản phẩm.</p>
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
                    <td>{Number(product.price).toLocaleString("vi-VN")} VND</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.tags && product.tags.length > 0
                        ? product.tags.join(", ")
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                      >
                        {loading ? "Đang xóa..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default DeleteProductAdmin;
