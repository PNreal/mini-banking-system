import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const ok = await onLogin(form);
      if (ok) {
        navigate('/admin');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
              <i className="fas fa-shield-alt fa-2x text-danger"></i>
            </div>
            <h2 className="h4 mb-1">Đăng nhập quản trị</h2>
            <p className="text-muted mb-0">
              Khu vực dành riêng cho quản trị viên hệ thống MiniBank.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </fieldset>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button 
                type="submit" 
                className="btn btn-danger px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Đăng nhập Admin
                  </>
                )}
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



