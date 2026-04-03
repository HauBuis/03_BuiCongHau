import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <h2>Chào mừng đến với Cake & Candy Paradise</h2>
        <p>Những chiếc bánh ngọt và kẹo tuyệt vời nhất cho bạn</p>
        <button
          className="cta-button"
          onClick={() => navigate("/products")}
        >
          Xem sản phẩm
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3> Bánh Ngọt</h3>
          <p>Những chiếc bánh tươi mới hàng ngày</p>
        </div>
        <div className="feature-card">
          <h3> Kẹo Ngon</h3>
          <p>Các loại kẹo chọn lọc từ khắp nơi</p>
        </div>
      </section>

      <section className="about">
        <h2>Về chúng tôi</h2>
        <p>
          Cake & Candy Paradise là một cửa hàng bán bánh ngọt và kẹo với
          chất lượng hàng đầu. Chúng tôi cam kết mang đến những sản phẩm
          tuyệt vời nhất cho khách hàng.
        </p>
      </section>
    </div>
  );
}

export default Home;