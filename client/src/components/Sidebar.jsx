import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const productMenuItems = [
  { label: "Tất cả sản phẩm", path: "/products" },
  { label: "Bánh ngọt", path: "/products?category=banh-ngot" },
  { label: "Kẹo ngọt", path: "/products?category=keo-ngot" },
];

const adminMenuItems = [
  { label: "Thêm sản phẩm", path: "/admin/add" },
  { label: "Cập nhật sản phẩm", path: "/admin/update" },
  { label: "Xóa sản phẩm", path: "/admin/delete" },
  { label: "Import sản phẩm", path: "/admin/import" },
];

function Sidebar({ currentPage }) {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);

  function toggleMenu(menuName) {
    setExpandedMenu((current) => (current === menuName ? null : menuName));
  }

  function isActive(page) {
    if (page === "products") {
      return currentPage === "products";
    }

    if (page === "admin") {
      return currentPage === "admin";
    }

    return currentPage === page;
  }

  function renderSubmenu(items) {
    return (
      <div className="submenu">
        {items.map((item) => (
          <button
            key={item.path}
            className="submenu-link"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Menu</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${isActive("home") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Trang chủ
        </button>

        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${isActive("products") ? "active" : ""}`}
            onClick={() => {
              toggleMenu("products");
              navigate("/products");
            }}
          >
            <span>Sản phẩm</span>
            <span className={`chevron ${expandedMenu === "products" ? "open" : ""}`} />
          </button>

          {expandedMenu === "products" ? renderSubmenu(productMenuItems) : null}
        </div>

        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${isActive("admin") ? "active" : ""}`}
            onClick={() => {
              toggleMenu("admin");
              navigate("/admin/add");
            }}
          >
            <span>Admin</span>
            <span className={`chevron ${expandedMenu === "admin" ? "open" : ""}`} />
          </button>

          {expandedMenu === "admin" ? renderSubmenu(adminMenuItems) : null}
        </div>

        <button className="sidebar-link" onClick={() => navigate("/")}>
          Liên hệ
        </button>

        <button className="sidebar-link" onClick={() => navigate("/products")}>
          Tìm kiếm
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
