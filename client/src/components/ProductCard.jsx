import React, { useMemo, useState } from "react";

function ProductCard({ product, onUpdate, onDelete }) {
  const productId = product?.id || product?._id;
  const defaultImage = useMemo(() => "/images/hoa1.jpg", []);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price ?? "",
    description: product?.description || "",
    stock: product?.stock ?? "",
    image: product?.image || defaultImage,
    imageFile: null,
  });
  const [saving, setSaving] = useState(false);

  function beginEdit() {
    setForm({
      name: product?.name || "",
      price: product?.price ?? "",
      description: product?.description || "",
      stock: product?.stock ?? "",
      image: product?.image || defaultImage,
      imageFile: null,
    });
    setIsEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!productId) return;
    if (!String(form.name).trim() || form.price === "") {
      alert("Vui lòng nhập đủ `name` và `price`.");
      return;
    }

    const payload = {
      name: String(form.name),
      price: Number(form.price),
      description: form.description || "",
      stock: form.stock === "" ? 0 : Number(form.stock),
      image: form.image || defaultImage,
    };

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("price", String(payload.price));
      formData.append("description", payload.description);
      formData.append("stock", String(payload.stock));
      if (form.imageFile) {
        formData.append("imageFile", form.imageFile);
      } else {
        // Nếu không chọn file mới thì giữ nguyên ảnh cũ
        formData.append("image", payload.image);
      }

      await onUpdate(productId, formData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!productId) return;
    onDelete(productId);
  }

  return (
    <div className="product-card">
      <img
        src={`http://localhost:5000${product.image || defaultImage}`}
        alt={product?.name || "Product"}
        className="product-image"
      />

      <h3>{product?.name}</h3>
      <p>{product?.description}</p>
      <p className="price">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(product.price)}
      </p>

      {!isEditing ? (
        <div className="crud-actions">
          <button className="crud-button crud-button-secondary" type="button" onClick={beginEdit}>
            Sửa
          </button>
          <button className="crud-button crud-button-danger" type="button" onClick={handleDelete}>
            Xóa
          </button>
        </div>
      ) : (
        <form className="crud-inline-form" onSubmit={handleSave}>
          <input
            className="crud-input"
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="crud-input"
            type="number"
            placeholder="Giá"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            className="crud-input"
            type="number"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <input
            className="crud-input"
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="crud-actions" style={{ alignItems: "center" }}>
            <input
              className="crud-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
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
      )}
    </div>
  );
}

export default ProductCard;