import React from 'react';
import { Link } from 'react-router-dom';

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const Dashboard = ({ user, transactions, onFreezeToggle }) => {
  const isFrozen = user?.isFrozen;

  return (
    <div className="container dashboard-container fade-in">
      {isFrozen && (
        <div className="alert alert-danger shadow-sm border-0 mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Tài khoản của bạn đang bị khóa. Một số tính năng sẽ bị vô hiệu hóa.
        </div>
      )}

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card dashboard-card profile-card h-100 border-0">
            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
              <div className="avatar-holder mb-3">
                <img
                  src={user?.imageFile}
                  className="rounded-circle profile-img"
                  alt="User"
                />
              </div>
              <h3 className="user-name mb-1">{user?.username}</h3>
              <p className="text-muted mb-2">{user?.email}</p>
              <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                Số Tài Khoản: {user?.userId}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card balance-card text-white mb-4 border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="card-title mb-0 opacity-75">Số dư khả dụng</h3>
                <i className="fas fa-wallet fa-2x opacity-50"></i>
              </div>
              <h1 className="display-4 fw-bold mb-0">
                {formatAmount(user?.balance)} <span className="currency">VND</span>
              </h1>
              <p className="mt-3 mb-0 opacity-75 small">Có sẵn để rút tiền</p>
            </div>
          </div>

          <div className="card dashboard-card border-0 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold text-secondary">Thao tác nhanh</h5>
            </div>
            <div className="card-body pt-0">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Link
                    to="/deposit"
                    className={`btn quick-action-btn btn-deposit w-100 ${isFrozen ? 'disabled' : ''}`}
                    aria-disabled={isFrozen}
                  >
                    <div className="icon-wrapper">
                      <i className="fas fa-plus"></i>
                    </div>
                    <span>Nạp tiền</span>
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
                    <span>Rút tiền</span>
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
                    <span>Chuyển khoản</span>
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
                    <span>{isFrozen ? 'Kích hoạt lại tài khoản' : 'Đóng băng tài khoản'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card dashboard-card border-0">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-secondary">Lịch sử giao dịch</h5>
              <Link to="/transactions" className="text-primary small text-decoration-none">
                Xem tất cả
              </Link>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush transaction-list">
                {transactions.length ? (
                  transactions.map((trans) => (
                    <li
                      key={trans.id}
                      className="list-group-item d-flex justify-content-between align-items-start px-4 py-3 border-light"
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className={`trans-icon ${
                            trans.amount > 0 ? 'bg-soft-success' : 'bg-soft-danger'
                          } me-3`}
                        >
                          <i
                            className={`fas ${
                              trans.amount > 0 ? 'fa-arrow-up' : 'fa-arrow-down'
                            }`}
                          ></i>
                        </div>
                        <div>
                          <strong className="d-block text-dark mb-1">{trans.type}</strong>
                          <small className="text-muted d-flex align-items-center">
                            <i className="far fa-clock mr-1 me-1"></i>
                            {formatDate(trans.date)}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <span
                          className={`fw-bold d-block ${
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
                    <p className="mb-0">Chưa có giao dịch nào.</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

