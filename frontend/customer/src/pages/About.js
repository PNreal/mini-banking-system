import React from 'react';

const About = () => (
  <div className="content-section">
    <div className="row">
      <div className="col-md-7">
        <h1 className="mb-3">Giới thiệu BK88 Mini Banking</h1>
        <p className="text-muted mb-3">
          <strong>BK88 Mini Banking</strong> là hệ thống ngân hàng số mô phỏng, dùng để demo các luồng
          nghiệp vụ quan trọng như đăng ký tài khoản, đăng nhập, nạp tiền, rút tiền, chuyển khoản
          và quản lý hồ sơ người dùng.
        </p>
        <p className="text-muted mb-4">
          Mục tiêu là giúp team dễ hình dung trải nghiệm người dùng cuối, đồng thời kiểm thử luồng
          tích hợp giữa các microservice trong toàn hệ thống.
        </p>
        <h5 className="mb-2">Bạn có thể làm gì với BK88?</h5>
        <ul className="text-muted mb-0">
          <li>Khởi tạo và đăng nhập tài khoản cá nhân.</li>
          <li>Theo dõi số dư và lịch sử giao dịch ngay trên Dashboard.</li>
          <li>Thực hiện nạp tiền, rút tiền, chuyển khoản với giao diện thẻ hiện đại.</li>
          <li>Cập nhật thông tin hồ sơ, đổi mật khẩu và đóng băng / mở khóa tài khoản (demo).</li>
        </ul>
      </div>
      <div className="col-md-5 mt-4 mt-md-0">
        <div className="p-3 p-md-4 bg-light rounded h-100">
          <h6 className="text-uppercase text-muted mb-3">Công nghệ & kiến trúc</h6>
          <p className="text-muted small mb-2">
            Frontend xây dựng bằng <strong>React</strong>, <strong>React Router</strong>,{' '}
            <strong>Bootstrap 4</strong> và <strong>Font Awesome</strong>, chuyển đổi từ HTML/CSS
            gốc của phiên bản Flask sang SPA hiện đại.
          </p>
          <p className="text-muted small mb-0">
            Backend tổ chức theo kiến trúc <strong>microservice</strong> (user, account,
            transaction, notification, log, api-gateway...), phù hợp cho môi trường học tập,
            demo và thử nghiệm tính năng.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;

