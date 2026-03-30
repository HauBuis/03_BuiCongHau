import React from "react";

function Sidebar() {
  return (
    <div className="sidebar">
      <h3>Menu</h3>

      <ul>
        <li>
          <a href="/">Home</a>
        </li>

        <li>Products</li>
        <li style={{ paddingLeft: "20px" }}>
          <a href="/products/fresh">Hoa tươi</a>
        </li>
        <li style={{ paddingLeft: "20px" }}>
          <a href="/products/dried">Hoa sáp</a>
        </li>

        <li>Cart</li>
        <li style={{ paddingLeft: "20px" }}>
          <a href="/cart">Giỏ hàng</a>
        </li>
        <li style={{ paddingLeft: "20px" }}>
          <a href="/checkout">Thanh toán</a>
        </li>

        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;