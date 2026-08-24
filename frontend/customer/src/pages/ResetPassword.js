import React, { useState } from 'react';

const ResetPassword = ({ onSubmit }) => {
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="content-section">
      <fieldset className="form-group">
        <legend className="border-bottom mb-4">Thay đổi mật khẩu</legend>

        <div className="form-group">
          <label className="form-control-label">Mã OTP</label>
          <input
            name="otp"
            className="form-control form-control-lg"
            value={form.otp}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-control-label">Mật khẩu mới</label>
          <input
            type="password"
            name="password"
            className="form-control form-control-lg"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-control-label">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirm"
            className="form-control form-control-lg"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>
      </fieldset>
      <div className="form-group">
        <button type="submit" className="btn btn-outline-info">
          Đổi mật khẩu
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;

