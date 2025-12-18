import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfoApi, updateUserProfileApi, uploadAvatarApi } from '../api/client';

const Settings = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const [kycForm, setKycForm] = useState({
    idNumber: '',
    idType: 'CCCD', // CCCD, CMND, Passport
    issueDate: '',
    issuePlace: '',
    address: '',
  });

  const [kycStatus, setKycStatus] = useState('NOT_VERIFIED'); // NOT_VERIFIED, PENDING, VERIFIED, REJECTED
  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch user data từ backend khi component mount
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
          // Nếu không có endpoint, dùng dữ liệu từ props
          setForm({
            username: user?.username || '',
            email: user?.email || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Không thể tải thông tin người dùng. Sử dụng dữ liệu hiện có.');
        // Vẫn dùng dữ liệu từ props
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKycForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'front') {
        setIdFrontImage(file);
      } else if (type === 'back') {
        setIdBackImage(file);
      } else if (type === 'avatar') {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Vui lòng chọn file ảnh hợp lệ.');
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Kích thước ảnh không được vượt quá 5MB.');
          return;
        }
        setAvatarFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError('Vui lòng chọn ảnh đại diện.');
      return;
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadAvatarApi(token, avatarFile);
      
      if (response?.success || response?.data) {
        setSuccess('Cập nhật ảnh đại diện thành công!');
        // Cập nhật preview với URL mới từ server nếu có
        if (response?.data?.imageUrl || response?.data?.avatarUrl) {
          setAvatarPreview(response.data.imageUrl || response.data.avatarUrl);
        }
        // Clear file để có thể chọn lại
        setAvatarFile(null);
        // Refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError('Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      let errorMessage = 'Cập nhật ảnh đại diện thất bại.';
      if (err.message) {
        if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'Chức năng upload ảnh chưa được hỗ trợ trên server.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      setSaving(false);
      return;
    }

    try {
      // Gọi API để cập nhật thông tin user
      const response = await updateUserProfileApi(token, {
        fullName: form.username,
        email: form.email,
      });

      if (response?.success) {
        setSuccess('Cập nhật thông tin thành công!');
        // Cập nhật user trong parent component
        if (onUpdate) {
          onUpdate({
            username: form.username,
            email: form.email,
          });
        }
        // Refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError('Cập nhật thông tin thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      let errorMessage = 'Cập nhật thông tin thất bại.';
      if (err.message) {
        if (err.message.includes('Email already')) {
          errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          // Endpoint chưa có, dùng callback từ parent
          if (onUpdate) {
            onUpdate(form);
            setSuccess('Cập nhật thông tin thành công! (Demo mode)');
          }
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleKycSubmit = (e) => {
    e.preventDefault();
    // Demo - sẽ thay bằng API call thực tế
    setKycStatus('PENDING');
    alert('Đã gửi yêu cầu xác thực KYC. Vui lòng chờ duyệt.');
  };

  const getKycStatusBadge = () => {
    const statusMap = {
      NOT_VERIFIED: { text: 'Chưa xác thực', class: 'bg-secondary' },
      PENDING: { text: 'Đang chờ duyệt', class: 'bg-warning' },
      VERIFIED: { text: 'Đã xác thực', class: 'bg-success' },
      REJECTED: { text: 'Từ chối', class: 'bg-danger' },
    };
    const status = statusMap[kycStatus] || statusMap.NOT_VERIFIED;
    return <span className={`badge ${status.class} text-white`}>{status.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-section text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      {/* Success/Error Messages */}
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
          <img 
            className="rounded-circle account-img" 
            src={avatarPreview || user?.imageFile || `${process.env.PUBLIC_URL}/assets/default.jpg`} 
            alt="avatar"
            style={{ objectFit: 'cover' }}
          />
          {avatarPreview && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
              <span className="badge bg-success">Ảnh mới</span>
            </div>
          )}
        </div>
        <div className="media-body">
          <h2 className="account-heading">{user?.username || 'User'}</h2>
          <p className="text-secondary">{user?.email || ''}</p>
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
          <button type="submit" className="btn btn-outline-info" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang lưu...
              </>
            ) : (
              'Lưu'
            )}
          </button>
          <Link className="btn btn-outline-secondary ml-2" to="/change-password">
            Đổi mật khẩu
          </Link>
        </div>

        <div className="form-group">
          <h5>Ảnh đại diện</h5>
          <div className="mb-3">
            <input 
              className="form-control form-control-lg" 
              type="file" 
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'avatar')}
              disabled={uploadingAvatar}
            />
            <small className="form-text text-muted d-block mt-1">
              Chọn ảnh đại diện (JPG, PNG, GIF - tối đa 5MB)
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
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Tải ảnh lên
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
                  Hủy
                </button>
                <small className="text-muted d-block mt-2">
                  Đã chọn: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(2)} KB)
                </small>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* KYC Tài khoản Section */}
      <div className="content-section mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="account-heading mb-0">KYC Tài khoản</h2>
          {getKycStatusBadge()}
        </div>

        {kycStatus === 'VERIFIED' ? (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            Tài khoản của bạn đã được xác thực thành công. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.
          </div>
        ) : kycStatus === 'PENDING' ? (
          <div className="alert alert-warning">
            <i className="fas fa-clock me-2"></i>
            Yêu cầu xác thực của bạn đang được xem xét. Vui lòng chờ phản hồi từ hệ thống.
          </div>
        ) : kycStatus === 'REJECTED' ? (
          <div className="alert alert-danger">
            <i className="fas fa-times-circle me-2"></i>
            Yêu cầu xác thực của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và tài liệu đã gửi, sau đó gửi lại yêu cầu.
          </div>
        ) : null}

        <form onSubmit={handleKycSubmit}>
          <fieldset className="form-group">
            <legend className="border-bottom mb-4">Thông tin định danh</legend>

            <div className="form-group">
              <label className="form-control-label">
                Loại giấy tờ <span className="text-danger">*</span>
              </label>
              <select
                name="idType"
                className="form-control form-control-lg"
                value={kycForm.idType}
                onChange={handleKycChange}
                required
                disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
              >
                <option value="CCCD">Căn cước công dân (CCCD)</option>
                <option value="CMND">Chứng minh nhân dân (CMND)</option>
                <option value="Passport">Hộ chiếu (Passport)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-control-label">
                Số giấy tờ <span className="text-danger">*</span>
              </label>
              <input
                name="idNumber"
                type="text"
                className="form-control form-control-lg"
                value={kycForm.idNumber}
                onChange={handleKycChange}
                placeholder="Nhập số giấy tờ"
                required
                disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-control-label">
                    Ngày cấp <span className="text-danger">*</span>
                  </label>
                  <input
                    name="issueDate"
                    type="date"
                    className="form-control form-control-lg"
                    value={kycForm.issueDate}
                    onChange={handleKycChange}
                    required
                    disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-control-label">
                    Nơi cấp <span className="text-danger">*</span>
                  </label>
                  <input
                    name="issuePlace"
                    type="text"
                    className="form-control form-control-lg"
                    value={kycForm.issuePlace}
                    onChange={handleKycChange}
                    placeholder="Nhập nơi cấp"
                    required
                    disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-control-label">
                Địa chỉ thường trú <span className="text-danger">*</span>
              </label>
              <textarea
                name="address"
                className="form-control form-control-lg"
                value={kycForm.address}
                onChange={handleKycChange}
                rows="3"
                placeholder="Nhập địa chỉ thường trú"
                required
                disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
              />
            </div>
          </fieldset>

          <fieldset className="form-group mt-4">
            <legend className="border-bottom mb-4">Tài liệu đính kèm</legend>

            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-control-label">
                    Mặt trước giấy tờ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control-file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'front')}
                    disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
                    required={kycStatus === 'NOT_VERIFIED' || kycStatus === 'REJECTED'}
                  />
                  {idFrontImage && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Đã chọn: {idFrontImage.name}
                      </small>
                    </div>
                  )}
                  <small className="form-text text-muted d-block mt-1">
                    Vui lòng upload ảnh rõ ràng, đầy đủ thông tin
                  </small>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label className="form-control-label">
                    Mặt sau giấy tờ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control-file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'back')}
                    disabled={kycStatus === 'PENDING' || kycStatus === 'VERIFIED'}
                    required={kycStatus === 'NOT_VERIFIED' || kycStatus === 'REJECTED'}
                  />
                  {idBackImage && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Đã chọn: {idBackImage.name}
                      </small>
                    </div>
                  )}
                  <small className="form-text text-muted d-block mt-1">
                    Vui lòng upload ảnh rõ ràng, đầy đủ thông tin
                  </small>
                </div>
              </div>
            </div>
          </fieldset>

          {(kycStatus === 'NOT_VERIFIED' || kycStatus === 'REJECTED') && (
            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane me-2"></i>
                Gửi yêu cầu xác thực
              </button>
            </div>
          )}

          {kycStatus === 'VERIFIED' && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Tài khoản của bạn đã được xác thực. Nếu cần cập nhật thông tin, vui lòng liên hệ bộ phận hỗ trợ.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;

