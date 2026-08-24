import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addCounterStaffApi,
  getCounterByAdminApi,
  getCounterStaffApi,
  removeCounterStaffApi,
  updateCounterStaffApi,
} from '../api/client';

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const CounterAdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // chứa staff record hiện tại
  const [staffForm, setStaffForm] = useState({
    email: '',
  });

  useEffect(() => {
    loadCounterData();
  }, []);

  const loadCounterData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('Bạn chưa đăng nhập.');
        setLoading(false);
        return;
      }

      const counterRes = await getCounterByAdminApi(token);
      const counterData = counterRes?.data || null;
      setCounter(counterData);

      if (!counterData?.counterId) {
        setStaffList([]);
        setLoading(false);
        return;
      }

      const staffRes = await getCounterStaffApi(token, counterData.counterId);
      const staffData = Array.isArray(staffRes?.data) ? staffRes.data : [];
      setStaffList(staffData);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load counter data:', error);
      setError('Lỗi khi tải dữ liệu quầy: ' + (error?.message || 'unknown'));
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({ email: '' });
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      email: staff.email || '',
    });
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi quầy?')) {
      return;
    }

    setActionLoading(`delete-${staffId}`);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Bạn chưa đăng nhập.');
      await removeCounterStaffApi(token, counter?.counterId, staffId);
      await loadCounterData();
    } catch (error) {
      alert('Lỗi khi xóa nhân viên: ' + (error?.message || 'unknown'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setActionLoading('save-staff');
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Bạn chưa đăng nhập.');

      if (editingStaff?.userId) {
        // Hiện tại admin quầy chỉ được bật/tắt nhân viên trong quầy (không sửa hồ sơ user)
        // Nếu cần sửa email/họ tên/mã NV, cần nghiệp vụ khác (admin tổng/user-service).
        await updateCounterStaffApi(token, counter?.counterId, editingStaff.userId, {
          isActive: true,
        });
      } else {
        await addCounterStaffApi(token, counter?.counterId, { email: staffForm.email });
      }

      await loadCounterData();
      setShowStaffModal(false);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStaffStatus = async (staff) => {
    const newActive = !staff.isActive;
    const action = newActive ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (!window.confirm(`Xác nhận ${action} nhân viên này?`)) {
      return;
    }

    setActionLoading(`toggle-${staff.userId}`);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('Bạn chưa đăng nhập.');
      await updateCounterStaffApi(token, counter?.counterId, staff.userId, { isActive: newActive });
      await loadCounterData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-success',
      INACTIVE: 'bg-secondary',
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Ngừng hoạt động',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Bạn chưa được phân bổ quản lý quầy nào. Vui lòng liên hệ admin hệ thống.
        </div>
        <Link to="/staff/dashboard" className="btn btn-primary mt-3">
          Quay lại Dashboard nhân viên
        </Link>
      </div>
    );
  }

  return (
    <div className="container counter-admin-dashboard-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Quản lý nhân viên trong quầy</h1>
          <p className="text-muted mb-0">
            <span className="badge bg-primary me-2">{counter.counterCode}</span>
            {counter.name}
          </p>
        </div>
        <div className="btn-group">
          <Link to="/staff/dashboard" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Counter Info Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">Thông tin quầy</h5>
              <p className="mb-2">
                <strong>Mã quầy:</strong> <span className="badge bg-primary">{counter.counterCode}</span>
              </p>
              <p className="mb-2">
                <strong>Tên quầy:</strong> {counter.name}
              </p>
              <p className="mb-2">
                <strong>Địa chỉ:</strong> {counter.address || 'Chưa có địa chỉ'}
              </p>
            </div>
            <div className="col-md-6">
              <h5 className="mb-3">Giới hạn nhân sự</h5>
              <small className="text-muted">Số nhân viên tối đa:</small>
              <div className="fw-bold">{counter.maxStaff}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Staff Management */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">Quản lý nhân viên</h5>
              <button className="btn btn-primary btn-sm" onClick={handleAddStaff}>
                <i className="fas fa-plus me-2"></i>
                Thêm nhân viên
              </button>
            </div>
            <div className="card-body p-0">
              {staffList.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                  <p>Quầy này chưa có nhân viên nào</p>
                  <button className="btn btn-primary btn-sm" onClick={handleAddStaff}>
                    <i className="fas fa-plus me-2"></i>
                    Thêm nhân viên đầu tiên
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã NV</th>
                        <th>Email</th>
                        <th>Tên</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff) => (
                        <tr key={staff.userId}>
                          <td>
                            <strong className="text-primary">{staff.employeeCode || '-'}</strong>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: 260 }}>{staff.email || '-'}</td>
                          <td>{staff.fullName || '-'}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(staff.isActive ? 'ACTIVE' : 'INACTIVE')}`}>
                              {getStatusLabel(staff.isActive ? 'ACTIVE' : 'INACTIVE')}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditStaff(staff)}
                                disabled={actionLoading}
                                title="Xem"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className={`btn btn-outline-${staff.isActive ? 'warning' : 'success'}`}
                                onClick={() => handleToggleStaffStatus(staff)}
                                disabled={actionLoading === `toggle-${staff.userId}`}
                                title={staff.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                {actionLoading === `toggle-${staff.userId}` ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <i className={`fas fa-${staff.isActive ? 'ban' : 'check'}`}></i>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteStaff(staff.userId)}
                                disabled={actionLoading === `delete-${staff.userId}`}
                                title="Xóa"
                              >
                                {actionLoading === `delete-${staff.userId}` ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <i className="fas fa-trash"></i>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa nhân viên */}
      {showStaffModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStaff ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStaffModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitStaff}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="staffEmail" className="form-label">
                      Email nhân viên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="staffEmail"
                      required
                      value={staffForm.email}
                      disabled={!!editingStaff}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    />
                    {editingStaff && (
                      <small className="text-muted">
                        Hiện tại admin quầy chỉ bật/tắt hoặc gỡ nhân viên khỏi quầy (không chỉnh sửa hồ sơ user).
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowStaffModal(false)}
                    disabled={actionLoading === 'save-staff'}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading === 'save-staff'}
                  >
                    {actionLoading === 'save-staff' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterAdminDashboard;

