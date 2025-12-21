import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      window.alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!form.password || form.password.length < 12) {
      window.alert('Mật khẩu phải có ít nhất 12 ký tự theo yêu cầu hệ thống.');
      return;
    }

    const ok = await onRegister(form);
    if (ok) {
      navigate('/login');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="content-section">
          <form onSubmit={handleSubmit}>
            <fieldset className="form-group mb-3">
              <legend className="border-bottom mb-3">Đăng ký tài khoản</legend>

              <div className="form-group mb-3">
                <label className="form-control-label">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

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

              <div className="form-group mb-2">
                <label className="form-control-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </fieldset>
            <div className="form-group mb-2">
              <button type="submit" className="btn btn-outline-info btn-block w-100">
                Đăng ký
              </button>
            </div>
          </form>
          <div className="border-top pt-2 mt-2 text-center">
            <small className="text-muted">
              Đã có tài khoản?{' '}
              <Link className="ml-1" to="/login">
                Đăng nhập
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
