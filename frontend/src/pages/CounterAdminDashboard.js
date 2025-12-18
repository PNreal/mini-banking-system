import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    todayTransactions: 0,
    todayAmount: 0,
    pendingTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    staffCode: '',
    staffName: '',
  });

  useEffect(() => {
    loadCounterData();
  }, []);

  const loadCounterData = async () => {
    setLoading(true);
    try {
      // Demo data - sẽ thay bằng API call thực tế
      // Giả sử user có counterId trong thông tin
      setTimeout(() => {
        const mockCounter = {
          counterId: 'counter-1',
          counterCode: 'Q001',
          name: 'Quầy giao dịch số 1',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          maxStaff: 10,
          adminUserId: user?.userId || 'admin-1',
          isActive: true,
        };
        setCounter(mockCounter);

        setStaffList([
          {
            staffId: 'staff-1',
            staffCode: 'NV001',
            staffName: 'Nguyễn Văn A',
            status: 'ACTIVE',
          },
          {
            staffId: 'staff-2',
            staffCode: 'NV002',
            staffName: 'Trần Thị B',
            status: 'ACTIVE',
          },
          {
            staffId: 'staff-3',
            staffCode: 'NV003',
            staffName: 'Lê Văn C',
            status: 'INACTIVE',
          },
        ]);

        setStats({
          totalStaff: 3,
          activeStaff: 2,
          todayTransactions: 45,
          todayAmount: 125000000,
          pendingTransactions: 5,
        });

        setRecentTransactions([
          {
            id: 'tx-1',
            transactionCode: 'NV00112340108',
            customerName: 'Nguyễn Văn Khách',
            amount: 5000000,
            type: 'COUNTER_DEPOSIT',
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tx-2',
            transactionCode: 'NV00256780108',
            customerName: 'Trần Thị Khách',
            amount: 10000000,
            type: 'COUNTER_DEPOSIT',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load counter data:', error);
      alert('Lỗi khi tải dữ liệu quầy: ' + error.message);
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
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

    setActionLoading(`delete-${staffId}`);
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStaffList((prev) => prev.filter((s) => s.staffId !== staffId));
      alert('Xóa nhân viên thành công');
    } catch (error) {
      alert('Lỗi khi xóa nhân viên: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setActionLoading('save-staff');
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (editingStaff) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.staffId === editingStaff.staffId
              ? { ...s, ...staffForm }
              : s
          )
        );
        alert('Cập nhật nhân viên thành công');
      } else {
        const newStaff = {
          staffId: `staff-${Date.now()}`,
          ...staffForm,
          status: 'ACTIVE',
        };
        setStaffList((prev) => [...prev, newStaff]);
        alert('Thêm nhân viên thành công');
      }
      setShowStaffModal(false);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStaffStatus = async (staff) => {
    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (!window.confirm(`Xác nhận ${action} nhân viên này?`)) {
      return;
    }

    setActionLoading(`toggle-${staff.staffId}`);
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStaffList((prev) =>
        prev.map((s) =>
          s.staffId === staff.staffId
            ? { ...s, status: newStatus }
            : s
        )
      );
      alert(`Đã ${action} nhân viên thành công`);
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
      PENDING: 'bg-warning',
      COMPLETED: 'bg-success',
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Ngừng hoạt động',
      PENDING: 'Chờ xử lý',
      COMPLETED: 'Hoàn thành',
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
          <h1 className="h3 mb-1">Quản lý quầy giao dịch</h1>
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
              <h5 className="mb-3">Thống kê</h5>
              <div className="row">
                <div className="col-6 mb-2">
                  <small className="text-muted">Số nhân viên tối đa:</small>
                  <div className="fw-bold">{counter.maxStaff}</div>
                </div>
                <div className="col-6 mb-2">
                  <small className="text-muted">Nhân viên hiện tại:</small>
                  <div className="fw-bold text-success">{stats.activeStaff}/{stats.totalStaff}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng nhân viên</h6>
                  <h3 className="mb-0">{stats.totalStaff}</h3>
                </div>
                <i className="fas fa-users fa-2x text-primary opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Giao dịch hôm nay</h6>
                  <h3 className="mb-0">{formatAmount(stats.todayTransactions)}</h3>
                </div>
                <i className="fas fa-exchange-alt fa-2x text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng số tiền</h6>
                  <h3 className="mb-0">{formatAmount(stats.todayAmount)} đ</h3>
                </div>
                <i className="fas fa-money-bill-wave fa-2x text-info opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Chờ xử lý</h6>
                  <h3 className="mb-0 text-warning">{formatAmount(stats.pendingTransactions)}</h3>
                </div>
                <i className="fas fa-hourglass-half fa-2x text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Staff Management */}
        <div className="col-lg-6 mb-4">
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
                        <th>Tên nhân viên</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff) => (
                        <tr key={staff.staffId}>
                          <td>
                            <strong className="text-primary">{staff.staffCode}</strong>
                          </td>
                          <td>{staff.staffName}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(staff.status)}`}>
                              {getStatusLabel(staff.status)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditStaff(staff)}
                                disabled={actionLoading}
                                title="Sửa"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className={`btn btn-outline-${staff.status === 'ACTIVE' ? 'warning' : 'success'}`}
                                onClick={() => handleToggleStaffStatus(staff)}
                                disabled={actionLoading === `toggle-${staff.staffId}`}
                                title={staff.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                {actionLoading === `toggle-${staff.staffId}` ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <i className={`fas fa-${staff.status === 'ACTIVE' ? 'ban' : 'check'}`}></i>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteStaff(staff.staffId)}
                                disabled={actionLoading === `delete-${staff.staffId}`}
                                title="Xóa"
                              >
                                {actionLoading === `delete-${staff.staffId}` ? (
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

        {/* Recent Transactions */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold text-secondary">Giao dịch gần đây</h5>
            </div>
            <div className="card-body p-0">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-receipt fa-3x mb-3 opacity-50"></i>
                  <p>Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã GD</th>
                        <th>Khách hàng</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <small className="text-muted">{tx.transactionCode}</small>
                          </td>
                          <td>{tx.customerName}</td>
                          <td>{formatAmount(tx.amount)} đ</td>
                          <td>
                            <span className={`badge ${getStatusBadge(tx.status)}`}>
                              {getStatusLabel(tx.status)}
                            </span>
                          </td>
                          <td>
                            <small>{formatDate(tx.createdAt)}</small>
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

export default CounterAdminDashboard;

