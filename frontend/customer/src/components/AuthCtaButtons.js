import React from 'react';
import { Link } from 'react-router-dom';

const AuthCtaButtons = () => (
  <div className="row g-2 g-md-3">
    <div className="col-12 col-md-6 mb-2 mb-md-0">
      <Link className="btn btn-primary btn-lg btn-block w-100" to="/register">
        Bắt đầu ngay
      </Link>
    </div>
    <div className="col-12 col-md-6 mt-1 mt-md-0">
      <Link className="btn btn-outline-secondary btn-lg btn-block w-100" to="/login">
        Đăng nhập
      </Link>
    </div>
  </div>
);

export default AuthCtaButtons;


