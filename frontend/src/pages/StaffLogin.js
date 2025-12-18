import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { checkIsCounterAdminApi } from '../api/client';

const StaffLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await onLogin(form);
      if (ok) {
        // Kiểm tra xem user có phải là admin quầy không
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          try {
            const isCounterAdmin = await checkIsCounterAdminApi(token);
            if (isCounterAdmin) {
              // Nếu là admin quầy, điều hướng đến trang admin quầy
              navigate('/counter/admin/dashboard');
              return;
            }
          } catch (error) {
            // Nếu API không có hoặc lỗi, tiếp tục điều hướng bình thường
            console.log('Could not check counter admin status:', error);
          }
        }
        // Nếu không phải admin quầy, điều hướng đến dashboard nhân viên
        navigate('/staff/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-5">
        <div className="content-section shadow-sm rounded-3">
          <div className="text-center mb-4">
            <div className="mb-2">
              <i className="fas fa-user-tie fa-2x text-primary"></i>
            </div>
            <h2 className="h4 mb-1">Đăng nhập nhân viên</h2>
            <p className="text-muted mb-0">
              Khu vực dành riêng cho nhân viên giao dịch của MiniBank.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="form-group mb-3">
              <div className="form-group mb-3">
                <label className="form-control-label">Email nhân viên</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="staff@example.com"
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
                  placeholder="Nhập mật khẩu nhân viên"
                  required
                />
              </div>
            </fieldset>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Đăng nhập Nhân viên
                  </>
                )}
              </button>
              <small className="text-muted">
                <Link to="/login">Đăng nhập khách hàng</Link>
              </small>
            </div>

            <div className="border-top pt-2 mt-2 text-center">
              <small className="text-muted d-block">
                Chỉ dành cho tài khoản được phân quyền nhân viên.
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;


