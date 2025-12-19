import React, { useState } from 'react';
import { cancelCounterDepositApi } from '../api/client';

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

const Transactions = ({ transactions, onTransactionUpdate }) => {
  const [cancellingIds, setCancellingIds] = useState(new Set());

  const handleCancel = async (transactionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy giao dịch này?')) {
      return;
    }

    setCancellingIds(prev => new Set(prev).add(transactionId));
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      await cancelCounterDepositApi(token, transactionId);
      alert('Đã hủy giao dịch thành công');
      if (onTransactionUpdate) {
        onTransactionUpdate();
      }
    } catch (error) {
      alert('Lỗi khi hủy giao dịch: ' + error.message);
    } finally {
      setCancellingIds(prev => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { text: 'Chờ xử lý', class: 'badge bg-warning' },
      'SUCCESS': { text: 'Thành công', class: 'badge bg-success' },
      'FAILED': { text: 'Thất bại', class: 'badge bg-danger' },
      'CANCELLED': { text: 'Đã hủy', class: 'badge bg-secondary' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'badge bg-secondary' };
    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };
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
          {transactions.map((trans) => {
            const isPendingCounterDeposit = trans.status === 'PENDING' && 
                                           (trans.type === 'COUNTER_DEPOSIT' || trans.type === 'Nạp tiền ở quầy');
            const isCancelling = cancellingIds.has(trans.id || trans.transactionId);
            
            return (
              <li
                key={trans.id || trans.transactionId}
                className="list-group-item d-flex justify-content-between align-items-center px-2 px-md-4 py-3 border-light"
              >
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong className="text-dark">{trans.type || 'Giao dịch'}</strong>
                    {trans.status && getStatusBadge(trans.status)}
                  </div>
                  <small className="text-muted d-flex align-items-center">
                    <i className="far fa-clock mr-1 me-1"></i>
                    {formatDate(trans.date || trans.timestamp)}
                  </small>
                  {trans.transactionCode && (
                    <small className="text-muted d-block mt-1">
                      Mã GD: {trans.transactionCode}
                    </small>
                  )}
                </div>
                <div className="text-end d-flex flex-column align-items-end gap-2">
                  <span
                    className={`fw-bold ${
                      trans.amount > 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {trans.amount > 0 ? '+' : ''}
                    {formatAmount(trans.amount)} đ
                  </span>
                  {isPendingCounterDeposit && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCancel(trans.id || trans.transactionId)}
                      disabled={isCancelling}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      {isCancelling ? 'Đang hủy...' : 'Hủy'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Transactions;


