import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi } from '../api/client';

const ChangePassword = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldpass: '', newpass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate
    if (form.newpass !== form.confirm) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    if (form.newpass.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.oldpass === form.newpass) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    try {
      const response = await changePasswordApi(token, form.oldpass, form.newpass);
      
      if (response?.success || response?.message) {
        setSuccess('Đổi mật khẩu thành công!');
        setForm({ oldpass: '', newpass: '', confirm: '' });
        
        // Notify parent component if callback provided
        if (onSubmit) {
          onSubmit(form);
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(-1); // Go back to previous page
        }, 2000);
      } else {
        setError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      let errorMessage = 'Đổi mật khẩu thất bại.';
      
      if (err.message) {
        if (err.message.includes('incorrect') || err.message.includes('Invalid')) {
          errorMessage = 'Mật khẩu hiện tại không đúng.';
        } else if (err.message.includes('different')) {
          errorMessage = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <legend className="border-bottom mb-4">Đổi Mật Khẩu</legend>

          <div className="form-group mb-3">
            <label className="form-control-label">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="oldpass"
              className="form-control form-control-lg"
              value={form.oldpass}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-control-label">Mật khẩu mới</label>
            <input
              type="password"
              name="newpass"
              className="form-control form-control-lg"
              value={form.newpass}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              minLength={6}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-control-label">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirm"
              className="form-control form-control-lg"
              value={form.confirm}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </fieldset>
        <div className="form-group">
          <button 
            type="submit" 
            className="btn btn-outline-info"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              'Cập nhật'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary ms-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
