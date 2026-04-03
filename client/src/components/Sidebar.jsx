import React, { useState } from "react";

function Sidebar({ currentPage, onNavigate }) {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Menu</h2>
      </div>

      <nav className="sidebar-nav">
        {/* Trang chủ */}
        <button
          className={`sidebar-link ${currentPage === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          Trang chủ
        </button>

        {/* Sản phẩm */}
        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${currentPage === "products" ? "active" : ""}`}
            onClick={() => {
              toggleMenu("products");
              onNavigate("products");
            }}
          >
            <span>Sản phẩm</span>
            <span className={`chevron ${expandedMenu === "products" ? "open" : ""}`}>▼</span>
          </button>

          {expandedMenu === "products" && (
            <div className="submenu">
              <button className="submenu-link" onClick={() => onNavigate("products")}>
                Tất cả sản phẩm
              </button>
              <button className="submenu-link" onClick={() => onNavigate("products")}>
                Bánh ngọt
              </button>
              <button className="submenu-link" onClick={() => onNavigate("products")}>
                Kẹo & Snack
              </button>
            </div>
          )}
        </div>

        {/* Admin */}
        <div className="sidebar-group">
          <button
            className={`sidebar-link group-title ${currentPage === "admin" ? "active" : ""}`}
            onClick={() => {
              toggleMenu("admin");
              onNavigate("admin");
            }}
          >
            <span>Admin</span>
            <span className={`chevron ${expandedMenu === "admin" ? "open" : ""}`}>▼</span>
          </button>

          {expandedMenu === "admin" && (
            <div className="submenu">
              <button className="submenu-link" onClick={() => onNavigate("admin","add")}>
                Thêm sản phẩm
              </button>
              <button className="submenu-link" onClick={() => onNavigate("admin","update")}>
                Cập nhật sản phẩm
              </button>
              <button className="submenu-link" onClick={() => onNavigate("admin","delete")}>
                Xóa sản phẩm
              </button>
            </div>
          )}
        </div>

        {/* Liên hệ */}
        <button
          className="sidebar-link"
          onClick={() => onNavigate("home")}
        >
          Liên hệ
        </button>

        {/* Tìm kiếm */}
        <button
          className="sidebar-link"
          onClick={() => onNavigate("products")}
        >
          Tìm kiếm
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;