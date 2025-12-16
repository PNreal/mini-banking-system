import React, { useState } from 'react';

const ChangePassword = ({ onSubmit }) => {
  const [form, setForm] = useState({ oldpass: '', newpass: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="content-section">
      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <legend className="border-bottom mb-4">Đổi Mật Khẩu</legend>

          <div className="form-group">
            <label className="form-control-label">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="oldpass"
              className="form-control form-control-lg"
              value={form.oldpass}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-control-label">Mật khẩu mới</label>
            <input
              type="password"
              name="newpass"
              className="form-control form-control-lg"
              value={form.newpass}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-control-label">Xác nhận mật khẩu mới</label>
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
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

