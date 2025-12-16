import React from 'react';
import AuthCtaButtons from '../components/AuthCtaButtons';

const Home = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <p className="text-uppercase text-muted mb-2">Ngân hàng số BK88</p>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Nạp 1 phút, rút 1 giây
          </h1>
          <p className="lead text-secondary mb-4">
            Trải nghiệm giao dịch an toàn, nhanh chóng với giao diện hiện đại. Đăng ký miễn phí
            để bắt đầu chuyển tiền, nạp/rút và quản lý tài khoản mọi lúc.
          </p>
          <AuthCtaButtons />
        </div>
        <div className="col-lg-6">
          <div className="card dashboard-card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="text-muted mb-3">Tính năng nổi bật</h5>
              <ul className="list-unstyled mb-0">
                <li className="d-flex mb-3">
                  <div className="icon-wrapper me-3" style={{ backgroundColor: '#ddcf7c' }}>
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div>
                    <strong>Giao dịch tức thời</strong>
                    <p className="mb-0 text-muted small">
                      Xử lý nạp, rút, chuyển khoản nhanh với giao diện trực quan.
                    </p>
                  </div>
                </li>
                <li className="d-flex mb-3">
                  <div className="icon-wrapper me-3" style={{ backgroundColor: '#d1ecf1' }}>
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <strong>Bảo mật nhiều lớp</strong>
                    <p className="mb-0 text-muted small">
                      Mã hóa và xác thực để đảm bảo an toàn tài khoản.
                    </p>
                  </div>
                </li>
                <li className="d-flex">
                  <div className="icon-wrapper me-3" style={{ backgroundColor: '#d4edda' }}>
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <strong>Đa nền tảng</strong>
                    <p className="mb-0 text-muted small">
                      Hoạt động mượt trên web, tối ưu cho thiết bị di động.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

