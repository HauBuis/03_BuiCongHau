import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildProductRequestData,
  createEmptyProductForm,
  mapProductToForm,
  validateProductForm,
} from "./productAdminShared";
import {
  API_BASE_URL,
  getCategoryLabel,
  getProductId,
  PRODUCT_CATEGORIES,
} from "./productShared";

function ProductManagementAdmin({
  mode,
  products,
  loading,
  setLoading,
  onProductAdded,
  onProductUpdated,
  onProductDeleted,
}) {
  const navigate = useNavigate();
  const formSectionRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(createEmptyProductForm);
  const [imagePreview, setImagePreview] = useState(null);
  const selectedProductId = getProductId(selectedProduct);
  const isAddMode = mode === "add";
  const isUpdateMode = mode === "update";
  const isDeleteMode = mode === "delete";

  function resetForm() {
    setSelectedProduct(null);
    setFormData(createEmptyProductForm());
    setImagePreview(null);
  }

  function handleFieldChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      handleFieldChange("imageFile", null);
      setImagePreview(null);
      return;
    }

    handleFieldChange("imageFile", file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function startEditProduct(product) {
    setSelectedProduct(product);
    setFormData(mapProductToForm(product));
    setImagePreview(null);

    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isUpdateMode && !selectedProduct) {
      alert("Chưa chọn sản phẩm để cập nhật.");
      return;
    }

    const validationMessage = validateProductForm(formData);

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      setLoading(true);

      const productId = getProductId(selectedProduct);
      const endpoint = isUpdateMode
        ? `${API_BASE_URL}/api/products/${productId}`
        : `${API_BASE_URL}/api/products`;
      const method = isUpdateMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: buildProductRequestData(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            (isUpdateMode
              ? "Cập nhật sản phẩm thất bại."
              : "Thêm sản phẩm thất bại.")
        );
      }

      const savedProduct = await response.json().catch(() => null);
      const savedProductId =
        getProductId(savedProduct) || getProductId(selectedProduct);

      alert(
        isUpdateMode
          ? "Cập nhật sản phẩm thành công."
          : "Thêm sản phẩm thành công."
      );

      resetForm();

      if (isUpdateMode) {
        await onProductUpdated?.();
      } else {
        await onProductAdded?.();
      }

      if (savedProductId) {
        navigate(`/products/${savedProductId}`);
      }
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm("Xóa sản phẩm này?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Xóa sản phẩm thất bại.");
      }

      alert("Xóa sản phẩm thành công.");

      if (selectedProductId === productId) {
        resetForm();
      }

      await onProductDeleted?.();
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function renderProductForm() {
    if (isDeleteMode) {
      return null;
    }

    if (isUpdateMode && !selectedProduct) {
      return (
        <p>Vui lòng chọn sản phẩm cần cập nhật trong danh sách bên dưới.</p>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Tên sản phẩm *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => handleFieldChange("name", event.target.value)}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(event) =>
              handleFieldChange("description", event.target.value)
            }
            placeholder="Nhập mô tả sản phẩm"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Giá (VND) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(event) => handleFieldChange("price", event.target.value)}
            placeholder="Nhập giá"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Tồn kho *</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(event) => handleFieldChange("stock", event.target.value)}
            placeholder="Nhập số lượng tồn kho"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Loại sản phẩm *</label>
          <select
            value={formData.category}
            onChange={(event) =>
              handleFieldChange("category", event.target.value)
            }
            required
          >
            <option value="">Chọn loại sản phẩm</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
            placeholder="Ví dụ: sinh nhật, tặng quà"
          />
        </div>

        <div className="form-group">
          <label>Hình ảnh</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview ? (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : null}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading
            ? "Đang xử lý..."
            : isUpdateMode
              ? "Cập nhật sản phẩm"
              : "Thêm sản phẩm"}
        </button>
      </form>
    );
  }

  function renderTableAction(product) {
    const productId = getProductId(product);

    if (isDeleteMode) {
      return (
        <button
          className="delete-btn"
          type="button"
          onClick={() => handleDeleteProduct(productId)}
          disabled={loading}
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </button>
      );
    }

    if (isUpdateMode) {
      return (
        <button
          className="submit-btn"
          type="button"
          onClick={() => startEditProduct(product)}
        >
          Chọn để sửa
        </button>
      );
    }

    return null;
  }

  function renderTable() {
    if (isAddMode) {
      return null;
    }

    return (
      <div style={{ marginTop: "30px" }}>
        <h3>Danh sách sản phẩm</h3>
        {products.length === 0 ? (
          <p className="no-products">Không có sản phẩm.</p>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>{isDeleteMode ? "Tags" : "Loại"}</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const productId = getProductId(product);

                  return (
                    <tr
                      key={productId}
                      style={{
                        backgroundColor:
                          isUpdateMode && selectedProductId === productId
                            ? "rgba(102, 126, 234, 0.1)"
                            : "transparent",
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>{Number(product.price).toLocaleString("vi-VN")} VND</td>
                      <td>{product.stock}</td>
                      <td>
                        {isDeleteMode
                          ? product.tags && product.tags.length > 0
                            ? product.tags.join(", ")
                            : "-"
                          : getCategoryLabel(product.type?.id) || "-"}
                      </td>
                      <td>{renderTableAction(product)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function getSectionTitle() {
    if (isUpdateMode) {
      return "Cập nhật sản phẩm";
    }

    if (isDeleteMode) {
      return "Xóa sản phẩm";
    }

    return "Thêm sản phẩm mới";
  }

  function getSectionDescription() {
    if (isDeleteMode) {
      return "Hãy nhấn nút xóa trong danh sách sản phẩm bên dưới.";
    }

    return null;
  }

  return (
    <section className="admin-form-section" ref={formSectionRef}>
      <h2>{getSectionTitle()}</h2>
      {getSectionDescription() ? <p>{getSectionDescription()}</p> : null}
      {renderProductForm()}
      {renderTable()}
    </section>
  );
}

export default ProductManagementAdmin;
