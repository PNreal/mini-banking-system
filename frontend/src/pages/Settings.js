import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Settings = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div className="content-section">
      <div className="media">
        <img className="rounded-circle account-img" src={user.imageFile} alt="avatar" />
        <div className="media-body">
          <h2 className="account-heading">{user.username}</h2>
          <p className="text-secondary">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <h1>
            <legend className="border-bottom mb-4"> Thông tin tài khoản</legend>
          </h1>
          <div className="form-group">
            <label className="form-control-label">Username</label>
            <input
              name="username"
              className="form-control form-control-lg"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-control-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control form-control-lg"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </fieldset>

        <div className="form-group">
          <button type="submit" className="btn btn-outline-info">
            Lưu
          </button>
          <Link className="btn btn-outline-secondary ml-2" to="/change-password">
            Đổi mật khẩu
          </Link>
        </div>

        <div className="form-group">
          <h5>Ảnh đại diện (demo)</h5>
          <input className="form-control-file" type="file" disabled />
          <span className="text-muted d-block mt-1">Tính năng upload chưa được kích hoạt.</span>
        </div>
      </form>
    </div>
  );
};

export default Settings;

