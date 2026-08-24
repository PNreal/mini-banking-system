import React, { useState } from 'react';

const ForgotPassword = ({ onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="content-section">
      <fieldset className="form-group">
        <legend className="border-bottom mb-4">Nhập email của bạn:</legend>
        <div className="form-group">
          <label className="form-control-label">Email</label>
          <input
            type="email"
            className="form-control form-control-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </fieldset>
      <div className="form-group">
        <button type="submit" className="btn btn-outline-info">
          Gửi yêu cầu
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;

