import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URL,
  DEFAULT_PRODUCT_IMAGE,
  getImageUrl,
} from "../utils/api";

function formatBadgeLabel(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);

        if (!response.ok) {
          setProduct(null);
          setError("Không thể tải sản phẩm.");
          return;
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setProduct(null);
        setError("Không thể kết nối tới server.");
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
        <p>{error || "Không tìm thấy sản phẩm."}</p>
        <button className="back-button" onClick={() => navigate("/products")}>
          Quay lại
        </button>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image || DEFAULT_PRODUCT_IMAGE);

  return (
    <div className="product-detail-page">
      <button className="back-button" onClick={() => navigate("/products")}>
        Quay lại
      </button>

      <div className="detail-container">
        <div className="detail-image">
          <img src={imageUrl} alt={product.name} />
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>

          <p className="detail-price">
            Giá:{" "}
            <strong>
              {Number(product.price || 0).toLocaleString("vi-VN")} VND
            </strong>
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
              <p>{product.type?.name || product.type}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="detail-tags">
              <h3>Tags</h3>
              <div className="tags-list">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag-badge">
                    {formatBadgeLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.events && product.events.length > 0 && (
            <div className="detail-events">
              <h3>Sự kiện</h3>
              <div className="events-list">
                {product.events.map((event, index) => (
                  <span key={index} className="event-badge">
                    {formatBadgeLabel(event)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Number(product.stock) <= 0 ? (
            <p className="out-of-stock">Hết hàng</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
