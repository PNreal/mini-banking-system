import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onLogin(form);
    if (ok) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-5">
        <div className="content-section shadow-sm rounded-3">
          <div className="text-center mb-4">
            <div className="mb-2">
              <i className="fas fa-shield-alt fa-2x text-danger"></i>
            </div>
            <h2 className="h4 mb-1">Đăng nhập quản trị</h2>
            <p className="text-muted mb-0">
              Khu vực dành riêng cho quản trị viên hệ thống MiniBank.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="form-group mb-3">
              <div className="form-group mb-3">
                <label className="form-control-label">Email quản trị</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label className="form-control-label">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập mật khẩu quản trị"
                  required
                />
              </div>
            </fieldset>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button type="submit" className="btn btn-danger px-4">
                <i className="fas fa-sign-in-alt me-2"></i>
                Đăng nhập Admin
              </button>
              <small className="text-muted">
                <Link to="/login">Đăng nhập người dùng</Link>
              </small>
            </div>

            <div className="border-top pt-2 mt-2 text-center">
              <small className="text-muted d-block">
                Chỉ dành cho tài khoản được phân quyền ADMIN.
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;



