import React, { useState } from "react";
import * as XLSX from "xlsx";
import { API_BASE_URL, PRODUCT_CATEGORIES } from "./productShared";

const CATEGORY_ALIASES = [
  {
    value: "banh-ngot",
    label: "Bánh ngọt",
    ids: ["T01", "T02", "T04", "T05", "T06"],
  },
  { value: "keo-ngot", label: "Kẹo ngọt", ids: ["T03", "T07"] },
];

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildHeaderMap(row) {
  const map = {};

  Object.keys(row || {}).forEach((key) => {
    map[normalizeHeader(key)] = row[key];
  });

  return map;
}

function getFieldValue(headerMap, aliases) {
  for (const alias of aliases) {
    const value = headerMap[alias];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

function normalizeCategoryValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveCategory(rawType) {
  const normalizedType = normalizeCategoryValue(rawType);

  return (
    CATEGORY_ALIASES.find((category) => {
      const normalizedValue = normalizeCategoryValue(category.value);
      const normalizedLabel = normalizeCategoryValue(category.label);
      const normalizedIds = category.ids.map((id) => normalizeCategoryValue(id));

      return (
        normalizedType === normalizedValue ||
        normalizedType === normalizedLabel ||
        normalizedIds.includes(normalizedType)
      );
    }) ||
    PRODUCT_CATEGORIES.find((category) => {
      const normalizedValue = normalizeCategoryValue(category.value);
      const normalizedLabel = normalizeCategoryValue(category.label);

      return (
        normalizedType === normalizedValue ||
        normalizedType === normalizedLabel
      );
    }) ||
    null
  );
}

function mapRowToProduct(row, index) {
  const headerMap = buildHeaderMap(row);
  const name = String(
    getFieldValue(headerMap, ["name", "ten", "tensanpham", "productname"])
  ).trim();
  const description = String(
    getFieldValue(headerMap, ["description", "mota", "motasanpham", "desc"])
  ).trim();
  const rawPrice = getFieldValue(headerMap, ["price", "gia"]);
  const rawStock = getFieldValue(headerMap, ["stock", "tonkho", "quantity", "qty"]);
  const rawType = String(
    getFieldValue(headerMap, ["type", "loai", "loaisanpham"])
  ).trim();
  const matchedCategory = resolveCategory(rawType);
  const hasPrice = String(rawPrice ?? "").trim() !== "";
  const hasStock = String(rawStock ?? "").trim() !== "";
  const price = Number(rawPrice);
  const stock = Number(rawStock);
  const errors = [];

  if (!name) {
    errors.push("Thiếu tên sản phẩm");
  }

  if (!hasPrice) {
    errors.push("Thiếu giá");
  } else if (Number.isNaN(price)) {
    errors.push("Giá không hợp lệ");
  } else if (price <= 1000) {
    errors.push("Giá phải lớn hơn 1.000");
  }

  if (!hasStock) {
    errors.push("Thiếu tồn kho");
  } else if (Number.isNaN(stock)) {
    errors.push("Tồn kho không hợp lệ");
  } else if (!Number.isInteger(stock)) {
    errors.push("Tồn kho phải là số nguyên");
  } else if (stock < 0) {
    errors.push("Tồn kho không được nhỏ hơn 0");
  }

  if (!rawType) {
    errors.push("Thiếu type");
  } else if (!matchedCategory) {
    errors.push("Loại sản phẩm không hợp lệ");
  }

  return {
    rowNumber: index + 2,
    errors,
    payload:
      errors.length > 0
        ? null
        : {
            name,
            description,
            price,
            stock,
            tags: parseList(getFieldValue(headerMap, ["tags", "tag"])),
            type: {
              id: matchedCategory.value,
              name: matchedCategory.label,
            },
          },
  };
}

async function parseWorkbookRows(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

function ImportProductsAdmin({ onProductsImported, loading, setLoading }) {
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("");
      setPreviewRows([]);
      setParsedRows([]);
      return;
    }

    try {
      const rows = await parseWorkbookRows(file);

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("File không có dữ liệu.");
      }

      setFileName(file.name);
      setPreviewRows(rows.slice(0, 5));
      setParsedRows(rows.map((row, index) => mapRowToProduct(row, index)));
    } catch (error) {
      console.error("Import parse error:", error);
      alert(`Không đọc được file: ${error.message}`);
      setFileName("");
      setPreviewRows([]);
      setParsedRows([]);
    }
  }

  async function handleImportProducts() {
    if (parsedRows.length === 0) {
      alert("Vui lòng chọn file hợp lệ trước khi import.");
      return;
    }

    const invalidRows = parsedRows.filter((row) => row.errors.length > 0);

    if (invalidRows.length > 0) {
      alert("Có dòng dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      setLoading(true);

      const results = [];

      for (const row of parsedRows) {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row.payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          results.push({
            rowNumber: row.rowNumber,
            success: false,
            message: errorData.message || "Import thất bại",
          });
          continue;
        }

        results.push({
          rowNumber: row.rowNumber,
          success: true,
          message: "Đã tạo",
        });
      }

      const successCount = results.filter((item) => item.success).length;
      const failedCount = results.filter((item) => !item.success).length;

      await onProductsImported?.();
      alert(`Thành công: ${successCount}\nThất bại: ${failedCount}`);
      window.location.reload();
    } catch (error) {
      console.error("Import submit error:", error);
      alert(`Import thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const invalidRows = parsedRows.filter((row) => row.errors.length > 0);

  return (
    <section className="admin-form-section">
      <h2>Import sản phẩm</h2>

      <div className="admin-import-note">
        <p>Hỗ trợ file `.csv`, `.xlsx`, `.xls`.</p>
        <p>Cột bắt buộc: `name`, `price`, `stock`, `type`.</p>
        <p>Cột tùy chọn: `description`, `tags`.</p>
      </div>

      <div className="form-group">
        <label>Chọn file import</label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {fileName ? <p className="import-file-name">File: {fileName}</p> : null}

      {parsedRows.length > 0 ? (
        <div className="admin-import-summary">
          <p>Tổng dòng đọc được: {parsedRows.length}</p>
          <p>Dòng hợp lệ: {parsedRows.length - invalidRows.length}</p>
          <p>Dòng lỗi: {invalidRows.length}</p>
        </div>
      ) : null}

      {invalidRows.length > 0 ? (
        <div className="admin-import-errors">
          <h3>Dòng cần sửa</h3>
          <ul>
            {invalidRows.slice(0, 10).map((row) => (
              <li key={row.rowNumber}>
                Dòng {row.rowNumber}: {row.errors.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {previewRows.length > 0 ? (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                {Object.keys(previewRows[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={index}>
                  {Object.keys(previewRows[0]).map((key) => (
                    <td key={`${index}-${key}`}>{String(row[key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <button
        type="button"
        className="submit-btn"
        onClick={handleImportProducts}
        disabled={loading || parsedRows.length === 0 || invalidRows.length > 0}
      >
        {loading ? "Đang import..." : "Import sản phẩm"}
      </button>
    </section>
  );
}

export default ImportProductsAdmin;
