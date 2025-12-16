import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="error-page fade-in">
            <h1 className="display-1 fw-bold text-danger">403</h1>
            <h2 className="h4 mb-4">Truy cập bị từ chối</h2>
            <p className="text-muted mb-4">
              Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/dashboard" className="btn btn-primary">
                <i className="fas fa-arrow-left me-2"></i>
                Về Dashboard
              </Link>
              <Link to="/" className="btn btn-outline-secondary">
                <i className="fas fa-home me-2"></i>
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;





