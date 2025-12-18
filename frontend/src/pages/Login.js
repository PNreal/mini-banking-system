import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onLogin(form);
    if (ok) {
      navigate('/');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="content-section">
          <form onSubmit={handleSubmit}>
            <fieldset className="form-group mb-3">
              <legend className="border-bottom mb-3">Đăng nhập</legend>

              <div className="form-group mb-3">
                <label className="form-control-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-control-label">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="remember">
                  Ghi nhớ đăng nhập
                </label>
              </div>
            </fieldset>
            <div className="form-group mb-2 d-flex justify-content-between align-items-center">
              <button type="submit" className="btn btn-outline-info">
                Đăng nhập
              </button>
              <small className="text-muted">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </small>
            </div>
          </form>
          <div className="border-top pt-2 mt-2 text-center">
            <small className="text-muted">
              Chưa có tài khoản?{' '}
              <Link className="ml-1" to="/register">
                Đăng ký ngay
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

