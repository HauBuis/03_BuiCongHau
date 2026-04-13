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
          <h3>Kẹo ngọt</h3>
          <p>Lựa chọn phù hợp cho nhiều dịp khác nhau.</p>
        </div>
      </section>

      <section className="about">
        <h2>Về chúng tôi</h2>
        <p>
          Cake & Candy Paradise là cửa hàng chuyên cung cấp các loại bánh
          ngọt, kẹo và quà tặng dành cho nhiều dịp đặc biệt. Chúng tôi mong
          muốn mang đến cho khách hàng không chỉ những sản phẩm ngon miệng, mà
          còn là những khoảnh khắc ngọt ngào, ấm áp và đáng nhớ bên gia đình,
          bạn bè và người thân.
        </p>
        <p>
          Với tiêu chí chất lượng, thẩm mỹ và sự tận tâm, mỗi sản phẩm tại Cake
          & Candy Paradise đều được lựa chọn kỹ lưỡng về nguyên liệu, hương vị
          và hình thức. Từ bánh sinh nhật, bánh kem tươi đến các loại kẹo,
          snack và quà tặng, chúng tôi luôn hướng đến trải nghiệm ngọt ngào và
          trọn vẹn nhất cho khách hàng.
        </p>
        <p>
          Chúng tôi tin rằng mỗi chiếc bánh hay món quà nhỏ đều có thể thay lời
          yêu thương. Vì vậy, Cake & Candy Paradise luôn nỗ lực để trở thành
          người bạn đồng hành trong những dịp sinh nhật, lễ kỷ niệm, ngày đặc
          biệt và cả những khoảnh khắc giản dị thường ngày.
        </p>
      </section>
    </div>
  );
}

export default Home;
