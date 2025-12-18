import React, { useEffect, useState } from 'react';
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

const StaffDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayAmount: 0,
    pendingApprovals: 0,
    customersServed: 0,
  });
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data – sau này sẽ thay bằng gọi API thực tế
    setTimeout(() => {
      setStats({
        todayTransactions: 24,
        todayAmount: 78000000,
        pendingApprovals: 5,
        customersServed: 18,
      });

      setPendingTransactions([
        {
          id: 'tx-1',
          type: 'Rút tiền',
          customer: 'Nguyễn Văn A',
          accountNumber: '000123456789',
          amount: 15000000,
          createdAt: '2025-01-08T08:30:00Z',
          status: 'PENDING',
        },
        {
          id: 'tx-2',
          type: 'Chuyển khoản liên ngân hàng',
          customer: 'Trần Thị B',
          accountNumber: '000987654321',
          amount: 25000000,
          createdAt: '2025-01-08T09:10:00Z',
          status: 'PENDING',
        },
        {
          id: 'tx-3',
          type: 'Mở tài khoản mới',
          customer: 'Lê Văn C',
          accountNumber: 'Sẽ cấp sau',
          amount: 0,
          createdAt: '2025-01-08T09:45:00Z',
          status: 'REVIEW',
        },
      ]);

      setRecentCustomers([
        {
          id: 'cus-1',
          name: 'Nguyễn Văn A',
          accountNumber: '000123456789',
          product: 'Tài khoản thanh toán',
          lastAction: 'Rút tiền 5.000.000đ',
          lastActionAt: '2025-01-08T08:35:00Z',
        },
        {
          id: 'cus-2',
          name: 'Trần Thị B',
          accountNumber: '000987654321',
          product: 'Tài khoản thanh toán',
          lastAction: 'Chuyển khoản 10.000.000đ',
          lastActionAt: '2025-01-08T09:15:00Z',
        },
        {
          id: 'cus-3',
          name: 'Lê Văn C',
          accountNumber: 'Đang khởi tạo',
          product: 'Tài khoản thanh toán',
          lastAction: 'Tạo hồ sơ mở tài khoản',
          lastActionAt: '2025-01-08T09:50:00Z',
        },
      ]);

      setLoading(false);
    }, 500);
  }, []);

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
        <div>
          <h1 className="h3 mb-1">Bảng điều khiển Nhân viên giao dịch</h1>
          <p className="text-muted mb-0">
            Xin chào {user?.username || 'Nhân viên'}, chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          <i className="fas fa-home me-2"></i>
          Về Dashboard khách hàng
        </Link>
      </div>

      {/* Thông tin nhân viên + thống kê nhanh */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex">
              <div className="me-3 d-flex align-items-start">
                <div className="avatar-holder-sm">
                  <i className="fas fa-user-tie fa-2x text-primary"></i>
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Nhân viên phụ trách</h6>
                <h5 className="mb-1">{user?.username || 'Nhân viên BK88'}</h5>
                <p className="mb-1 small text-muted">
                  Mã nhân viên:{' '}
                  <span className="fw-semibold">
                    {user?.userId || 'NV0001'}
                  </span>
                </p>
                <p className="mb-0 small text-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Giao dịch hôm nay</h6>
                      <h3 className="mb-0">{formatAmount(stats.todayTransactions)}</h3>
                    </div>
                    <i className="fas fa-receipt fa-2x text-primary opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Tổng số tiền xử lý</h6>
                      <h3 className="mb-0">{formatAmount(stats.todayAmount)} đ</h3>
                    </div>
                    <i className="fas fa-money-check-alt fa-2x text-success opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Đang chờ duyệt</h6>
                      <h3 className="mb-0 text-warning">
                        {formatAmount(stats.pendingApprovals)}
                      </h3>
                    </div>
                    <i className="fas fa-hourglass-half fa-2x text-warning opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Khách hàng phục vụ</h6>
                      <h3 className="mb-0">{formatAmount(stats.customersServed)}</h3>
                    </div>
                    <i className="fas fa-users fa-2x text-info opacity-50"></i>
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
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">Giao dịch chờ xử lý</h5>
              <span className="badge bg-warning text-dark">
                {pendingTransactions.length} giao dịch
              </span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          Không có giao dịch chờ xử lý
                        </td>
                      </tr>
                    ) : (
                      pendingTransactions.map((tx) => (
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Khách hàng gần đây */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-sm h-100">
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
                          STK: {c.accountNumber} • {c.product}
                        </div>
                        <small className="text-muted">
                          {c.lastAction} • {formatDate(c.lastActionAt)}
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


