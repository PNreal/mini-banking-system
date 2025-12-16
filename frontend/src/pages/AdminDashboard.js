import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [report, setReport] = useState({
    totalUsers: 0,
    totalTransactionsToday: 0,
    totalAmount: 0,
    failedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    // Demo data - sẽ thay bằng API call thực tế
    setTimeout(() => {
      setUsers([
        {
          userId: 'uuid-1',
          email: 'user1@example.com',
          fullName: 'Nguyễn Văn A',
          status: 'ACTIVE',
          balance: 5000000,
          createdAt: '2025-01-01T10:00:00Z',
        },
        {
          userId: 'uuid-2',
          email: 'user2@example.com',
          fullName: 'Trần Thị B',
          status: 'FROZEN',
          balance: 2000000,
          createdAt: '2025-01-02T11:00:00Z',
        },
        {
          userId: 'uuid-3',
          email: 'user3@example.com',
          fullName: 'Lê Văn C',
          status: 'LOCKED',
          balance: 1000000,
          createdAt: '2025-01-03T12:00:00Z',
        },
      ]);
      setReport({
        totalUsers: 1200,
        totalTransactionsToday: 350,
        totalAmount: 15000000,
        failedTransactions: 5,
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleAction = async (action, userId) => {
    if (!window.confirm(`Xác nhận ${getActionLabel(action)} tài khoản này?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, status: getNewStatus(u.status, action) }
            : u
        )
      );
      alert(`Đã ${getActionLabel(action)} tài khoản thành công`);
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      lock: 'khóa',
      unlock: 'mở khóa',
      freeze: 'đóng băng',
      unfreeze: 'mở đóng băng',
    };
    return labels[action] || action;
  };

  const getNewStatus = (currentStatus, action) => {
    if (action === 'lock') return 'LOCKED';
    if (action === 'unlock') return 'ACTIVE';
    if (action === 'freeze') return 'FROZEN';
    if (action === 'unfreeze') return 'ACTIVE';
    return currentStatus;
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-success',
      FROZEN: 'bg-warning',
      LOCKED: 'bg-danger',
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Hoạt động',
      FROZEN: 'Đóng băng',
      LOCKED: 'Đã khóa',
    };
    return labels[status] || status;
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
    <div className="container admin-dashboard-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Bảng điều khiển Admin</h1>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Về Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng người dùng</h6>
                  <h3 className="mb-0">{formatAmount(report.totalUsers)}</h3>
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
                  <h3 className="mb-0">{formatAmount(report.totalTransactionsToday)}</h3>
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
                  <h3 className="mb-0">{formatAmount(report.totalAmount)} đ</h3>
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
                  <h6 className="text-muted mb-1">Giao dịch lỗi</h6>
                  <h3 className="mb-0 text-danger">{formatAmount(report.failedTransactions)}</h3>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x text-danger opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lọc theo trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="FROZEN">Đóng băng</option>
                <option value="LOCKED">Đã khóa</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo email hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-bold text-secondary">Quản lý người dùng</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Họ tên</th>
                  <th>Trạng thái</th>
                  <th>Số dư</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.userId}>
                      <td>{u.email}</td>
                      <td>{u.fullName || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(u.status)}`}>
                          {getStatusLabel(u.status)}
                        </span>
                      </td>
                      <td>{formatAmount(u.balance)} đ</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          {u.status === 'LOCKED' ? (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleAction('unlock', u.userId)}
                              disabled={actionLoading === u.userId}
                            >
                              {actionLoading === u.userId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <>
                                  <i className="fas fa-unlock me-1"></i>
                                  Mở khóa
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleAction('lock', u.userId)}
                              disabled={actionLoading === u.userId}
                            >
                              {actionLoading === u.userId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <>
                                  <i className="fas fa-lock me-1"></i>
                                  Khóa
                                </>
                              )}
                            </button>
                          )}

                          {u.status === 'FROZEN' ? (
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleAction('unfreeze', u.userId)}
                              disabled={actionLoading === u.userId}
                            >
                              {actionLoading === u.userId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <>
                                  <i className="fas fa-fire me-1"></i>
                                  Mở đóng băng
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleAction('freeze', u.userId)}
                              disabled={actionLoading === u.userId || u.status === 'LOCKED'}
                            >
                              {actionLoading === u.userId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <>
                                  <i className="fas fa-snowflake me-1"></i>
                                  Đóng băng
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;





