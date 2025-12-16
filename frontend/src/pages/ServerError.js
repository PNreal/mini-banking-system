import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ServerError = () => {
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="error-page fade-in">
            <h1 className="display-1 fw-bold text-danger">500</h1>
            <h2 className="h4 mb-4">Lỗi máy chủ</h2>
            <p className="text-muted mb-4">
              Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={handleRetry}
                disabled={retrying}
              >
                {retrying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang thử lại...
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo me-2"></i>
                    Thử lại
                  </>
                )}
              </button>
              <Link to="/dashboard" className="btn btn-outline-secondary">
                <i className="fas fa-tachometer-alt me-2"></i>
                Về Dashboard
              </Link>
            </div>
            <div className="mt-4">
              <Link to="/about" className="text-muted small text-decoration-none">
                <i className="fas fa-envelope me-1"></i>
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;





