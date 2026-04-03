import React, { useEffect, useState } from "react";

function ProductDetail({ productId, onNavigate }) {
  const API_BASE = "http://localhost:5000";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <p>Không tìm thấy sản phẩm</p>
        <button onClick={() => onNavigate("products")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button
        className="back-button"
        onClick={() => onNavigate("products")}
      >
        ← Quay lại
      </button>

      <div className="detail-container">
        <div className="detail-image">
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
          />
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>

          <p className="detail-price">
            Giá: <strong>{Number(product.price).toLocaleString("vi-VN")} VNĐ</strong>
          </p>

          <p className="detail-stock">
            Tồn kho: <strong>{product.stock}</strong>
          </p>

          {product.description && (
            <div className="detail-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.type && (
            <div className="detail-type">
              <h3>Loại sản phẩm</h3>
              <p>{product.type.name}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="detail-tags">
              <h3>Tags</h3>
              <div className="tags-list">
                {product.tags.map((tag, i) => (
                  <span key={i} className="tag-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.events && product.events.length > 0 && (
            <div className="detail-events">
              <h3>Sự kiện</h3>
              <div className="events-list">
                {product.events.map((event, i) => (
                  <span key={i} className="event-badge">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.stock > 0 ? (
            <button className="add-to-cart-btn">Thêm vào giỏ hàng</button>
          ) : (
            <p className="out-of-stock">Hết hàng</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
