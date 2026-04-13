import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PRODUCT_IMAGE, getImageUrl } from "../utils/api";

function ProductCard({ product, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const productId = product?.id || product?._id;
  const isAdminMode = Boolean(onUpdate && onDelete);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price ?? "",
    description: product?.description || "",
    stock: product?.stock ?? "",
    image: product?.image || DEFAULT_PRODUCT_IMAGE,
    imageFile: null,
  });
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm({
      name: product?.name || "",
      price: product?.price ?? "",
      description: product?.description || "",
      stock: product?.stock ?? "",
      image: product?.image || DEFAULT_PRODUCT_IMAGE,
      imageFile: null,
    });
  }

  function beginEdit() {
    resetForm();
    setIsEditing(true);
  }

  function goToDetail() {
    if (!productId) {
      return;
    }

    navigate(`/products/${productId}`);
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!productId || !onUpdate) {
      return;
    }

    if (!String(form.name).trim() || form.price === "") {
      alert("Vui lòng nhập đầy đủ tên và giá.");
      return;
    }

    const formData = new FormData();
    formData.append("name", String(form.name).trim());
    formData.append("price", String(Number(form.price)));
    formData.append("description", form.description || "");
    formData.append("stock", String(form.stock === "" ? 0 : Number(form.stock)));

    if (form.imageFile) {
      formData.append("imageFile", form.imageFile);
    } else {
      formData.append("image", form.image || DEFAULT_PRODUCT_IMAGE);
    }

    try {
      setSaving(true);
      await onUpdate(productId, formData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!productId || !onDelete) {
      return;
    }

    onDelete(productId);
  }

  return (
    <div className="product-card">
      <img
        src={getImageUrl(product?.image || DEFAULT_PRODUCT_IMAGE)}
        alt={product?.name || "Product"}
        className="product-image"
      />

      <h3>{product?.name}</h3>
      <p>{product?.description}</p>
      <p className="price">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
        }).format(Number(product?.price || 0))}
      </p>

      {isAdminMode ? (
        !isEditing ? (
          <div className="crud-actions">
            <button
              className="crud-button crud-button-secondary"
              type="button"
              onClick={beginEdit}
            >
              Sửa
            </button>
            <button
              className="crud-button crud-button-danger"
              type="button"
              onClick={handleDelete}
            >
              Xóa
            </button>
          </div>
        ) : (
          <form className="crud-inline-form" onSubmit={handleSave}>
            <input
              className="crud-input"
              placeholder="Tên sản phẩm"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
            <input
              className="crud-input"
              type="number"
              placeholder="Giá"
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
            />
            <input
              className="crud-input"
              type="number"
              placeholder="Tồn kho"
              value={form.stock}
              onChange={(event) =>
                setForm({ ...form, stock: event.target.value })
              }
            />
            <input
              className="crud-input"
              placeholder="Mô tả"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />

            <div className="crud-actions" style={{ alignItems: "center" }}>
              <input
                className="crud-input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setForm({ ...form, imageFile: file });
                }}
              />
            </div>

            <div className="crud-actions">
              <button className="crud-button" type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                className="crud-button crud-button-secondary"
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Hủy
              </button>
            </div>
          </form>
        )
      ) : (
        <div className="crud-actions">
          <button className="view-detail-btn" type="button" onClick={goToDetail}>
            Xem chi tiết
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
