import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactionsHistoryApi } from '../api/client';

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Ví dụ: 16:00 · 05/01
  return `${time} · ${day}/${month}`;
};

const Dashboard = ({ user, transactions, onFreezeToggle }) => {
  const isFrozen = user?.isFrozen;
  const [pendingCount, setPendingCount] = useState(0);
  
  // Fetch pending counter deposits count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) return;
        
        const res = await getTransactionsHistoryApi(token, { 
          page: 0, 
          size: 50,
          type: 'COUNTER_DEPOSIT'
        });
        const items = res?.data?.items || [];
        const pending = items.filter(tx => tx.status === 'PENDING');
        setPendingCount(pending.length);
      } catch (e) {
        console.log('Failed to fetch pending count:', e);
      }
    };
    
    fetchPendingCount();
    // Auto refresh mỗi 15 giây
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);
  
  // Giới hạn số lượng giao dịch hiển thị trên dashboard (5 giao dịch gần nhất)
  const MAX_DISPLAY_TRANSACTIONS = 5;
  const displayedTransactions = transactions.slice(0, MAX_DISPLAY_TRANSACTIONS);
  const hasMoreTransactions = transactions.length > MAX_DISPLAY_TRANSACTIONS;

  return (
    <div className="dashboard-wrapper fade-in">
      <div className="dashboard-container">
        {/* Thanh cảnh báo trạng thái tài khoản */}
        {isFrozen && (
          <div className="alert alert-danger shadow-sm border-0 mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Tài khoản của bạn đang bị khóa. Một số tính năng sẽ bị vô hiệu hóa.
          </div>
        )}

        {/* Thông báo giao dịch pending */}
        {pendingCount > 0 && (
          <div className="alert alert-warning shadow-sm border-0 mb-4 d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-clock me-2"></i>
              Bạn có <strong>{pendingCount}</strong> giao dịch nạp tiền đang chờ xử lý tại quầy.
            </div>
            <Link to="/pending-deposits" className="btn btn-sm btn-warning">
              Xem chi tiết
            </Link>
          </div>
        )}

        {/* Tiêu đề trang tổng quan */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 dashboard-page-header">
          <div className="mb-2 mb-md-0">
            <h2 className="page-title mb-1">Tổng quan tài khoản</h2>
            <p className="page-subtitle mb-0 text-muted">
              Xin chào, <strong>{user?.username}</strong>. Đây là tóm tắt nhanh tài khoản BK88 của bạn.
            </p>
          </div>
          <div className="d-none d-md-flex align-items-center gap-2 text-muted small">
            <i className="far fa-user-circle me-1"></i>
            <span>{user?.email}</span>
          </div>
        </div>

        {/* Hàng đầu: Profile và Balance Card */}
        <div className="row g-2 g-md-4 mb-3 mb-md-4 align-items-stretch">
          <div className="col-6 col-lg-4">
            <div className="card dashboard-card profile-card h-100 border-0">
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <div className="avatar-holder mb-2 mb-md-3">
                  <img
                    src={user?.imageFile}
                    className="rounded-circle profile-img"
                    alt="User"
                  />
                </div>
                <h3 className="user-name mb-1">{user?.username}</h3>
                <p className="text-muted mb-2 small">{user?.email}</p>
                {user?.accountNumber && user.accountNumber.trim() !== '' && (
                  <span className="badge rounded-pill bg-light text-dark border px-2 px-md-3 py-1 py-md-2 small">
                    Số Tài Khoản: {user.accountNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-8">
            <div className="card balance-card text-white h-100 border-0">
              <div className="card-body p-2 p-md-4 d-flex flex-column justify-content-between h-100">
                <div className="d-flex justify-content-between align-items-start mb-2 mb-md-3">
                  <h3 className="card-title mb-0 opacity-75 small">Số dư khả dụng</h3>
                  <i className="fas fa-wallet fa-lg fa-md-2x opacity-50"></i>
                </div>
                <div>
                  <h1 className="balance-amount fw-bold mb-1 mb-md-2">
                    {formatAmount(user?.balance)} <span className="currency">VND</span>
                  </h1>
                  <p className="mb-0 opacity-75 small">Có sẵn để rút tiền</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng thứ hai: Quick Actions */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12">
            <div className="card dashboard-card border-0">
              <div className="card-header bg-white border-0 py-2 py-md-3">
                <h5 className="mb-0 fw-bold text-secondary small">Thao tác nhanh</h5>
              </div>
              <div className="card-body pt-0 px-2 px-md-3 pb-2 pb-md-3">
                <div className="row g-2 g-md-3">
                  <div className="col-6 col-md-3">
                    <Link
                      to="/deposit"
                      className={`btn quick-action-btn btn-deposit w-100 ${isFrozen ? 'disabled' : ''}`}
                      aria-disabled={isFrozen}
                    >
                      <div className="icon-wrapper">
                        <i className="fas fa-plus"></i>
                      </div>
                      <span className="quick-action-text">Nạp tiền</span>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <Link
                      to="/withdraw"
                      className={`btn quick-action-btn btn-withdraw w-100 ${isFrozen ? 'disabled' : ''}`}
                      aria-disabled={isFrozen}
                    >
                      <div className="icon-wrapper">
                        <i className="fas fa-arrow-down"></i>
                      </div>
                      <span className="quick-action-text">Rút tiền</span>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <Link
                      to="/transfer"
                      className={`btn quick-action-btn btn-transfer w-100 ${isFrozen ? 'disabled' : ''}`}
                      aria-disabled={isFrozen}
                    >
                      <div className="icon-wrapper">
                        <i className="fas fa-exchange-alt"></i>
                      </div>
                      <span className="quick-action-text">Chuyển khoản</span>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <button
                      type="button"
                      className="btn quick-action-btn btn-freeze w-100"
                      onClick={onFreezeToggle}
                    >
                      <div className="icon-wrapper">
                        <i className="fas fa-snowflake"></i>
                      </div>
                      <span className="quick-action-text">{isFrozen ? 'Kích hoạt lại' : 'Đóng băng'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng thứ ba: Transaction History */}
        <div className="row">
          <div className="col-12">
            <div className="card dashboard-card border-0">
              <div className="card-header bg-white border-0 py-2 py-md-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-secondary small">Lịch sử giao dịch</h5>
                <Link to="/transactions" className="text-primary small text-decoration-none">
                  Xem tất cả
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="transaction-list-container">
                  <ul className="list-group list-group-flush transaction-list">
                    {displayedTransactions.length ? (
                      displayedTransactions.map((trans) => (
                        <li
                          key={trans.id}
                          className="list-group-item d-flex justify-content-between align-items-center px-3 px-md-4 py-2 py-md-3 border-light"
                        >
                          <div className="flex-grow-1">
                            <strong className="d-block text-dark mb-1 small">{trans.type}</strong>
                            <small className="text-muted d-flex align-items-center">
                              <i className="far fa-clock me-1"></i>
                              {formatDate(trans.date)}
                            </small>
                          </div>
                          <div className="text-end ms-2">
                            <span
                              className={`fw-bold d-block small ${
                                trans.amount > 0 ? 'text-success' : 'text-danger'
                              }`}
                            >
                              {trans.amount > 0 ? '+' : ''}
                              {formatAmount(trans.amount)} đ
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-center py-4 text-muted">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                          width="50"
                          className="mb-2 opacity-50"
                          alt="Empty"
                        />
                        <p className="mb-0 small">Chưa có giao dịch nào.</p>
                      </li>
                    )}
                    {hasMoreTransactions && (
                      <li className="list-group-item text-center py-2 py-md-3 border-light bg-light">
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Còn {transactions.length - MAX_DISPLAY_TRANSACTIONS} giao dịch khác.{' '}
                          <Link to="/transactions" className="text-primary text-decoration-none fw-bold">
                            Xem tất cả
                          </Link>
                        </small>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

