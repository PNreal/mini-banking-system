import React from 'react';

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const Transactions = ({ transactions }) => {
  return (
    <div className="content-section">
      <h2 className="mb-3">Lịch sử giao dịch</h2>
      <p className="text-muted mb-4">
        Danh sách tất cả giao dịch gần đây của bạn. Các giao dịch nạp tiền được hiển thị màu xanh,
        giao dịch rút/chuyển được hiển thị màu đỏ.
      </p>

      {transactions.length === 0 ? (
        <p className="text-muted mb-0">Chưa có giao dịch nào.</p>
      ) : (
        <ul className="list-group list-group-flush transaction-list">
          {transactions.map((trans) => (
            <li
              key={trans.id}
              className="list-group-item d-flex justify-content-between align-items-start px-2 px-md-4 py-3 border-light"
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default Transactions;


