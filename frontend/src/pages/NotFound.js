import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="error-page fade-in">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="h4 mb-4">Trang không tìm thấy</h2>
            <p className="text-muted mb-4">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/" className="btn btn-primary">
                <i className="fas fa-home me-2"></i>
                Về trang chủ
              </Link>
              <Link to="/dashboard" className="btn btn-outline-primary">
                <i className="fas fa-tachometer-alt me-2"></i>
                Về Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;





