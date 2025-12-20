import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkIsCounterAdminApi, confirmCounterDepositApi, getStaffDashboardApi } from '../api/client';

const DASHBOARD_PENDING_PREVIEW_LIMIT = 6;

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

const StaffDashboard = ({ user }) => {
  const staffId = user?.userId || 'NV0001';
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayAmount: 0,
    pendingApprovals: 0,
    customersServed: 0,
  });
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCounterAdmin, setIsCounterAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kycRequestsCount, setKycRequestsCount] = useState(0);

  const visiblePendingTransactions = pendingTransactions.slice(0, DASHBOARD_PENDING_PREVIEW_LIMIT);

  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    if (!silent) setRefreshing(true);
    try {
      const res = await getStaffDashboardApi(authToken, { pendingLimit: 20, recentCustomersLimit: 5 });
      const data = res?.data || {};

      const statsData = data?.stats || {};
      setStats({
        todayTransactions: Number(statsData.todayTransactions || 0),
        todayAmount: Number(statsData.todayAmount || 0),
        pendingApprovals: Number(statsData.pendingApprovals || 0),
        customersServed: Number(statsData.customersServed || 0),
      });

      const pending = Array.isArray(data?.pendingApprovals) ? data.pendingApprovals : [];
      setPendingTransactions(
        pending.map((p) => ({
          id: p.transactionId,
          type: p.type === 'COUNTER_DEPOSIT' ? 'Nạp tiền' : p.type,
          customer: p.customerName,
          accountNumber: p.accountNumber,
          amount: p.amount,
          createdAt: p.createdAt,
          status: p.status,
          transactionCode: p.transactionCode,
        }))
      );

      setKycRequestsCount(Number(data?.kycRequestsCount || 0));
      setRecentCustomers(Array.isArray(data?.recentCustomers) ? data.recentCustomers : []);
    } catch (e) {
      // Keep last known data; stop spinner
      console.log('Failed to load staff dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (txId) => {
    if (!authToken) return;
    try {
      await confirmCounterDepositApi(authToken, txId);
    } catch (e) {
      console.log('Failed to confirm counter deposit:', e);
    } finally {
      await loadDashboard({ silent: true });
    }
  };

  useEffect(() => {
    // Kiểm tra xem user có phải là admin quầy không
    const checkCounterAdmin = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          const isAdmin = await checkIsCounterAdminApi(token);
          setIsCounterAdmin(isAdmin);
        }
      } catch (error) {
        console.log('Could not check counter admin status:', error);
      }
    };
    checkCounterAdmin();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await loadDashboard();
    };
    run();

    const interval = setInterval(() => {
      if (isMounted) {
        loadDashboard({ silent: true });
      }
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [authToken]);

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
    <div className="container admin-dashboard-container fade-in staff-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Bảng điều khiển Nhân viên giao dịch</h1>
          <p className="text-muted mb-0">
            Xin chào {user?.username || 'Nhân viên'}, chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <div className="btn-group">
          {isCounterAdmin && (
            <Link to="/counter/admin/dashboard" className="btn btn-primary">
              <i className="fas fa-building me-2"></i>
              Quản lý quầy
            </Link>
          )}
        </div>
      </div>

      {/* Thông tin nhân viên + thống kê nhanh (chung 1 box) */}
      <div className="card border-0 shadow-sm mb-4 staff-overview-card">
        <div className="card-body">
          <div className="row align-items-stretch">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex h-100 staff-profile-card">
                <div className="staff-profile-body d-flex w-100">
                  <div className="me-3 d-flex align-items-start">
                    <div className="avatar-holder-sm"></div>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Nhân viên phụ trách</h6>
                    <h5 className="mb-1">{user?.username || 'Nhân viên BK88'}</h5>
                    <p className="mb-1 small text-muted staff-meta">
                      Mã nhân viên:{' '}
                      <span className="fw-semibold d-block text-truncate" title={staffId}>
                        {staffId}
                      </span>
                    </p>
                    <p className="mb-0 small text-muted staff-meta text-truncate" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100 staff-stat-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1 staff-stat-title">Giao dịch hôm nay</h6>
                      <h3 className="mb-0 staff-stat-value">{formatAmount(stats.todayTransactions)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100 staff-stat-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1 staff-stat-title">Tổng số tiền xử lý</h6>
                      <h3 className="mb-0 staff-stat-value">{formatAmount(stats.todayAmount)} đ</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100 staff-stat-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1 staff-stat-title">Đang chờ duyệt</h6>
                      <h3 className="mb-0 staff-stat-value">
                        {formatAmount(stats.pendingApprovals)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100 staff-stat-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1 staff-stat-title">Khách hàng phục vụ</h6>
                      <h3 className="mb-0 staff-stat-value">{formatAmount(stats.customersServed)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Bảng giao dịch chờ xử lý */}
      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="card border-0 shadow-sm h-100 staff-panel-card">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">Giao dịch chờ xử lý</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-warning text-dark">
                  {formatAmount(stats.pendingApprovals)} giao dịch
                </span>
                {kycRequestsCount > 0 && (
                  <span className="badge bg-info text-dark">
                    KYC: {kycRequestsCount}
                  </span>
                )}
                <Link to="/staff/pending-approvals" className="btn btn-sm btn-outline-primary">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Khách hàng</th>
                      <th>Loại GD</th>
                      <th>Số tiền</th>
                      <th>Thời gian</th>
                      <th>Duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePendingTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          Không có giao dịch chờ xử lý
                        </td>
                      </tr>
                    ) : (
                      visiblePendingTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <div className="fw-semibold">{tx.customer}</div>
                            <small className="text-muted">
                              STK: {tx.accountNumber}
                            </small>
                          </td>
                          <td>{tx.type}</td>
                          <td>{tx.amount ? `${formatAmount(tx.amount)} đ` : '-'}</td>
                          <td>{formatDate(tx.createdAt)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(tx.id)}
                              disabled={refreshing}
                            >
                              Duyệt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pendingTransactions.length > DASHBOARD_PENDING_PREVIEW_LIMIT && (
                <div className="px-3 py-2 border-top bg-light d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Đang hiển thị {DASHBOARD_PENDING_PREVIEW_LIMIT}/{formatAmount(stats.pendingApprovals)} giao dịch gần nhất.
                  </small>
                  <Link to="/staff/pending-approvals" className="btn btn-sm btn-link text-decoration-none">
                    Xem tất cả →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khách hàng gần đây */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-sm h-100 staff-panel-card">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">Khách hàng gần đây</h5>
              <span className="badge bg-light text-dark border">
                {recentCustomers.length} khách hàng
              </span>
            </div>
            <div className="card-body">
              {recentCustomers.length === 0 ? (
                <p className="text-muted mb-0 text-center">Chưa có khách hàng nào hôm nay.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentCustomers.map((c) => (
                    <li
                      key={c.id}
                      className="list-group-item px-0 d-flex justify-content-between align-items-start border-0 border-bottom"
                    >
                      <div>
                        <div className="fw-semibold mb-1">{c.name}</div>
                        <div className="small text-muted mb-1">
                          STK: {c.accountNumber} - {c.product}
                        </div>
                        <small className="text-muted">
                          {c.lastAction} - {formatDate(c.lastActionAt)}
                        </small>
                      </div>
                      <div className="ms-3">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-search me-1"></i>
                          Chi tiết
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
