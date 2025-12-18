import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCountersApi,
  createCounterApi,
  updateCounterApi,
  deleteCounterApi,
  getCounterDetailsApi,
  addStaffToCounterApi,
  updateStaffInCounterApi,
  removeStaffFromCounterApi,
} from '../api/client';

const AdminCounters = ({ user }) => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  
  // Form states
  const [counterForm, setCounterForm] = useState({
    counterCode: '',
    name: '',
    address: '',
    adminUserId: '',
  });
  const [staffForm, setStaffForm] = useState({
    staffCode: '',
    staffName: '',
  });

  useEffect(() => {
    loadCounters();
  }, []);

  useEffect(() => {
    if (selectedCounter) {
      loadCounterDetails(selectedCounter);
    }
  }, [selectedCounter]);

  const loadCounters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await getCountersApi(token);
      if (response && response.data) {
        setCounters(response.data);
      }
    } catch (error) {
      console.error('Failed to load counters:', error);
      alert('Lỗi khi tải danh sách quầy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCounterDetails = async (counterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await getCounterDetailsApi(token, counterId);
      if (response && response.data) {
        setStaffList(response.data.staff || []);
      }
    } catch (error) {
      console.error('Failed to load counter details:', error);
      alert('Lỗi khi tải chi tiết quầy: ' + error.message);
    }
  };

  const handleCreateCounter = () => {
    setEditingCounter(null);
    setCounterForm({ counterCode: '', name: '', address: '', adminUserId: '' });
    setShowCounterModal(true);
  };

  const handleEditCounter = (counter) => {
    setEditingCounter(counter);
    setCounterForm({
      counterCode: counter.counterCode || '',
      name: counter.name || '',
      address: counter.address || '',
      adminUserId: counter.adminUserId || '',
    });
    setShowCounterModal(true);
  };

  const handleDeleteCounter = async (counterId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quầy giao dịch này?')) {
      return;
    }

    setActionLoading(`delete-${counterId}`);
    try {
      const token = localStorage.getItem('token');
      await deleteCounterApi(token, counterId);
      alert('Xóa quầy giao dịch thành công');
      await loadCounters();
      if (selectedCounter === counterId) {
        setSelectedCounter(null);
        setStaffList([]);
      }
    } catch (error) {
      alert('Lỗi khi xóa quầy: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitCounter = async (e) => {
    e.preventDefault();
    setActionLoading('save-counter');
    try {
      const token = localStorage.getItem('token');
      if (editingCounter) {
        await updateCounterApi(token, editingCounter.counterId, counterForm);
        alert('Cập nhật quầy giao dịch thành công');
      } else {
        await createCounterApi(token, counterForm);
        alert('Tạo quầy giao dịch thành công');
      }
      setShowCounterModal(false);
      await loadCounters();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddStaff = () => {
    if (!selectedCounter) {
      alert('Vui lòng chọn một quầy giao dịch trước');
      return;
    }
    setEditingStaff(null);
    setStaffForm({ staffCode: '', staffName: '' });
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      staffCode: staff.staffCode || '',
      staffName: staff.staffName || '',
    });
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi quầy?')) {
      return;
    }

    setActionLoading(`delete-staff-${staffId}`);
    try {
      const token = localStorage.getItem('token');
      await removeStaffFromCounterApi(token, selectedCounter, staffId);
      alert('Xóa nhân viên thành công');
      await loadCounterDetails(selectedCounter);
    } catch (error) {
      alert('Lỗi khi xóa nhân viên: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    if (!selectedCounter) return;

    setActionLoading('save-staff');
    try {
      const token = localStorage.getItem('token');
      if (editingStaff) {
        await updateStaffInCounterApi(token, selectedCounter, editingStaff.staffId, staffForm);
        alert('Cập nhật nhân viên thành công');
      } else {
        await addStaffToCounterApi(token, selectedCounter, staffForm);
        alert('Thêm nhân viên thành công');
      }
      setShowStaffModal(false);
      await loadCounterDetails(selectedCounter);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
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

  return (
    <div className="container admin-counters-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => navigate('/admin/dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </button>
          <h1 className="h3 mb-0">Quản lý quầy giao dịch</h1>
        </div>
        <button className="btn btn-primary" onClick={handleCreateCounter}>
          <i className="fas fa-plus me-2"></i>
          Thêm quầy mới
        </button>
      </div>

      <div className="row">
        {/* Danh sách quầy giao dịch */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold text-secondary">Danh sách quầy</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {counters.length === 0 ? (
                  <div className="list-group-item text-center py-4 text-muted">
                    Chưa có quầy giao dịch nào
                  </div>
                ) : (
                  counters.map((counter) => (
                    <div
                      key={counter.counterId}
                      className={`list-group-item list-group-item-action ${
                        selectedCounter === counter.counterId ? 'active' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCounter(counter.counterId)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {counter.counterCode && (
                              <span className="badge bg-primary me-2">{counter.counterCode}</span>
                            )}
                            {counter.name}
                          </h6>
                          <p className="mb-0 text-muted small">{counter.address || 'Chưa có địa chỉ'}</p>
                        </div>
                        <div className="btn-group btn-group-sm" role="group" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEditCounter(counter)}
                            disabled={actionLoading}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteCounter(counter.counterId)}
                            disabled={actionLoading === `delete-${counter.counterId}`}
                          >
                            {actionLoading === `delete-${counter.counterId}` ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách nhân viên trong quầy */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">
                {selectedCounter
                  ? `Nhân viên - ${counters.find((c) => c.counterId === selectedCounter)?.name || ''}`
                  : 'Chọn quầy để xem nhân viên'}
              </h5>
              {selectedCounter && (
                <button className="btn btn-primary btn-sm" onClick={handleAddStaff}>
                  <i className="fas fa-plus me-2"></i>
                  Thêm nhân viên
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {!selectedCounter ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-hand-pointer fa-3x mb-3 opacity-50"></i>
                  <p>Vui lòng chọn một quầy giao dịch để xem danh sách nhân viên</p>
                </div>
              ) : staffList.length === 0 ? (
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
                        <th>Mã nhân viên</th>
                        <th>Tên nhân viên</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff) => (
                        <tr key={staff.staffId}>
                          <td>{staff.staffCode}</td>
                          <td>{staff.staffName}</td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditStaff(staff)}
                                disabled={actionLoading}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteStaff(staff.staffId)}
                                disabled={actionLoading === `delete-staff-${staff.staffId}`}
                              >
                                {actionLoading === `delete-staff-${staff.staffId}` ? (
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

      {/* Modal thêm/sửa quầy */}
      {showCounterModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCounter ? 'Sửa quầy giao dịch' : 'Thêm quầy giao dịch mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCounterModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitCounter}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="counterCode" className="form-label">
                      Mã quầy <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="counterCode"
                      required
                      value={counterForm.counterCode}
                      onChange={(e) => setCounterForm({ ...counterForm, counterCode: e.target.value.toUpperCase() })}
                      placeholder="VD: Q001, Q002"
                      maxLength={20}
                    />
                    <small className="form-text text-muted">Mã quầy phải là duy nhất (VD: Q001, Q002)</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="counterName" className="form-label">
                      Tên quầy <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="counterName"
                      required
                      value={counterForm.name}
                      onChange={(e) => setCounterForm({ ...counterForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="counterAddress" className="form-label">
                      Địa chỉ
                    </label>
                    <textarea
                      className="form-control"
                      id="counterAddress"
                      rows="3"
                      value={counterForm.address}
                      onChange={(e) => setCounterForm({ ...counterForm, address: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="adminUserId" className="form-label">
                      Admin quầy (User ID)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="adminUserId"
                      value={counterForm.adminUserId}
                      onChange={(e) => setCounterForm({ ...counterForm, adminUserId: e.target.value })}
                      placeholder="UUID của admin quầy (để trống nếu chưa chỉ định)"
                    />
                    <small className="form-text text-muted">
                      Nhập User ID của người sẽ làm admin quầy này. Có thể chỉ định sau.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCounterModal(false)}
                    disabled={actionLoading === 'save-counter'}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading === 'save-counter'}
                  >
                    {actionLoading === 'save-counter' ? (
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
                    <label htmlFor="staffCode" className="form-label">
                      Mã nhân viên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="staffCode"
                      required
                      value={staffForm.staffCode}
                      onChange={(e) => setStaffForm({ ...staffForm, staffCode: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="staffName" className="form-label">
                      Tên nhân viên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="staffName"
                      required
                      value={staffForm.staffName}
                      onChange={(e) => setStaffForm({ ...staffForm, staffName: e.target.value })}
                    />
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

export default AdminCounters;

