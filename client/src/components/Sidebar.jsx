import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ currentPage }) {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const isActive = (page) => {
    if (page === "products") {
      return currentPage === "products" || currentPage === "detail" || currentPage === "search";
    }
    if (page === "admin") {
      return currentPage === "admin";
    }
    return currentPage === page;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Menu</h2>
      </div>

      <nav className="sidebar-nav">
        {/* Trang chủ */}
        <button
          className={`sidebar-link ${isActive("home") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Trang chủ
        </button>

        {/* Sản phẩm */}
        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${isActive("products") ? "active" : ""}`}
            onClick={() => {
              toggleMenu("products");
              navigate("/products");
            }}
          >
            <span>Sản phẩm</span>
            <span className={`chevron ${expandedMenu === "products" ? "open" : ""}`}>˅</span>
          </button>

          {expandedMenu === "products" && (
            <div className="submenu">
              <button className="submenu-link" onClick={() => navigate("/products")}>
                Tất cả sản phẩm
              </button>
              <button className="submenu-link" onClick={() => navigate("/products?category=bánh-ngọt")}>
                Bánh ngọt
              </button>
              <button className="submenu-link" onClick={() => navigate("/products?category=kẹo-snack")}>
                Kẹo ngọt
              </button>
            </div>
          )}
        </div>

        {/* Admin */}
        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${isActive("admin") ? "active" : ""}`}
            onClick={() => {
              toggleMenu("admin");
              navigate("/admin/add");
            }}
          >
            <span>Admin</span>
            <span className={`chevron ${expandedMenu === "admin" ? "open" : ""}`}>˅</span>
          </button>

          {expandedMenu === "admin" && (
            <div className="submenu">
              <button className="submenu-link" onClick={() => navigate("/admin/add")}>
                Thêm sản phẩm
              </button>
              <button className="submenu-link" onClick={() => navigate("/admin/update")}>
                Cập nhật sản phẩm
              </button>
              <button className="submenu-link" onClick={() => navigate("/admin/delete")}>
                Xóa sản phẩm
              </button>
            </div>
          )}
        </div>

        {/* Liên hệ */}
        <button
          className="sidebar-link"
          onClick={() => navigate("/")}
        >
          Liên hệ
        </button>

        {/* Tìm kiếm */}
        <button
          className="sidebar-link"
          onClick={() => navigate("/products")}
        >
          Tìm kiếm
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;