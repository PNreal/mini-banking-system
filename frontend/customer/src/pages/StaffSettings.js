import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfoApi, updateUserProfileApi, uploadAvatarApi } from '../api/client';

const StaffSettings = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [isReadonlyProfile, setIsReadonlyProfile] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const userData = await getUserInfoApi(token);
        if (userData?.data) {
          setForm({
            username: userData.data.fullName || userData.data.username || user?.username || '',
            email: userData.data.email || user?.email || '',
          });
        } else {
          setForm({
            username: user?.username || '',
            email: user?.email || '',
          });
        }
        // Nhân viên không được tự đổi họ tên/email; chỉ admin (quầy/tổng)
        setIsReadonlyProfile(true);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Khong the tai thong tin nhan vien. Dang su dung du lieu hien co.');
        setForm({
          username: user?.username || '',
          email: user?.email || '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleChange = (e) => {
    if (isReadonlyProfile) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui long chon file anh hop le.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Kich thuoc anh khong duoc vuot qua 5MB.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError('Vui long chon anh dai dien.');
      return;
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      setError('Phien dang nhap da het han. Vui long dang nhap lai.');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadAvatarApi(token, avatarFile);
      if (response?.success || response?.data) {
        setSuccess('Cap nhat anh dai dien thanh cong!');
        if (response?.data?.imageUrl || response?.data?.avatarUrl) {
          setAvatarPreview(response.data.imageUrl || response.data.avatarUrl);
        }
        setAvatarFile(null);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError('Cap nhat anh dai dien that bai. Vui long thu lai.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Cap nhat anh dai dien that bai.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadonlyProfile) {
      setError('Bạn không được phép tự cập nhật họ tên/email. Vui lòng liên hệ admin quầy hoặc admin tổng.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      setError('Phien dang nhap da het han. Vui long dang nhap lai.');
      setSaving(false);
      return;
    }

    try {
      const response = await updateUserProfileApi(token, {
        fullName: form.username,
        email: form.email,
      });

      if (response?.success) {
        setSuccess('Cap nhat thong tin thanh cong!');
        if (onUpdate) {
          onUpdate({
            username: form.username,
            email: form.email,
          });
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError('Cap nhat thong tin that bai. Vui long thu lai.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Cap nhat thong tin that bai.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-section text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Dang tai...</span>
        </div>
        <p className="mt-3 text-muted">Dang tai thong tin...</p>
      </div>
    );
  }

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

      <div className="media">
        <div className="position-relative" style={{ display: 'inline-block' }}>
          <div
            className="rounded-circle account-img d-flex align-items-center justify-content-center bg-light text-primary"
            style={{ width: 150, height: 150, fontSize: '2.5rem' }}
          >
            <i className="fas fa-user-tie"></i>
          </div>
        </div>
        <div className="media-body">
          <h2 className="account-heading">{user?.username || 'Nhan vien'}</h2>
          <p className="text-secondary">{user?.email || ''}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <h1>
            <legend className="border-bottom mb-4">Thong tin nhan vien</legend>
          </h1>
          <div className="form-group">
            <label className="form-control-label">Ho va ten</label>
            <input
              name="username"
              className="form-control form-control-lg"
              value={form.username}
              onChange={handleChange}
              required
              readOnly
              disabled
            />
            <small className="text-muted">Chỉ admin quầy / admin tổng có quyền cập nhật.</small>
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
              readOnly
              disabled
            />
            <small className="text-muted">Chỉ admin quầy / admin tổng có quyền cập nhật.</small>
          </div>
        </fieldset>

        <div className="form-group">
          <button type="submit" className="btn btn-outline-info" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Dang luu...
              </>
            ) : (
              'Luu'
            )}
          </button>
          <Link className="btn btn-outline-secondary ml-2" to="/staff/change-password">
            Doi mat khau
          </Link>
        </div>

        <div className="form-group">
          <h5>Anh dai dien</h5>
          <div className="mb-3">
            <input
              className="form-control form-control-lg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingAvatar}
            />
            <small className="form-text text-muted d-block mt-1">
              Chon anh dai dien (JPG, PNG, GIF - toi da 5MB)
            </small>
            {avatarFile && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Dang tai len...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Tai anh len
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  disabled={uploadingAvatar}
                >
                  Huy
                </button>
                <small className="text-muted d-block mt-2">
                  Da chon: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(2)} KB)
                </small>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StaffSettings;
