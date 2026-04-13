import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <h2>Chào mừng đến với Cake & Candy Paradise</h2>
        <p>Những chiếc bánh ngọt và kẹo ngon dành cho bạn</p>
        <button className="cta-button" onClick={() => navigate("/products")}>
          Xem sản phẩm
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Bánh ngọt</h3>
          <p>Sản phẩm được cập nhật thường xuyên.</p>
        </div>
        <div className="feature-card">
          <h3>Kẹo ngon</h3>
          <p>Lựa chọn phù hợp cho nhiều dịp khác nhau.</p>
        </div>
      </section>

      <section className="about">
        <h2>Về chúng tôi</h2>
        <p>
          Đây là trang web giới thiệu và quản lý sản phẩm bánh kẹo với giao
          diện đơn giản, dễ sử dụng và dễ mở rộng.
        </p>
      </section>
    </div>
  );
}

export default Home;
