import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cancelCounterDepositApi, cancelCounterWithdrawApi, getPendingCounterTransactionsApi } from '../api/client';

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

const PendingDeposits = ({ user, onTransactionUpdate }) => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingIds, setCancellingIds] = useState(new Set());
  const navigate = useNavigate();

  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const loadPendingTransactions = async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    try {
      // Sử dụng API mới để lấy trực tiếp các giao dịch PENDING tại quầy
      const res = await getPendingCounterTransactionsApi(authToken);
      const items = res?.data || [];
      setPendingTransactions(items);
    } catch (e) {
      console.log('Failed to load pending transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingTransactions();
    // Auto refresh mỗi 10 giây
    const interval = setInterval(loadPendingTransactions, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleCancel = async (transactionId, transactionType) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy giao dịch này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setCancellingIds(prev => new Set(prev).add(transactionId));
    try {
      // Gọi API hủy tương ứng với loại giao dịch
      if (transactionType === 'COUNTER_WITHDRAW') {
        await cancelCounterWithdrawApi(authToken, transactionId);
      } else {
        await cancelCounterDepositApi(authToken, transactionId);
      }
      alert('Đã hủy giao dịch thành công!');
      await loadPendingTransactions();
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

  // Helper function để lấy thông tin hiển thị theo loại giao dịch
  const getTransactionInfo = (tx) => {
    const isWithdraw = tx.type === 'COUNTER_WITHDRAW';
    return {
      isWithdraw,
      amountClass: isWithdraw ? 'text-danger' : 'text-success',
      amountPrefix: isWithdraw ? '-' : '+',
      label: isWithdraw ? 'Rút tiền tại quầy giao dịch' : 'Nạp tiền tại quầy giao dịch',
      icon: isWithdraw ? 'fa-arrow-down' : 'fa-arrow-up'
    };
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
    <div className="container fade-in" style={{ maxWidth: '800px', padding: '1.5rem' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Giao dịch đang chờ xử lý</h2>
          <p className="text-muted mb-0 small">
            Các giao dịch tại quầy đang chờ nhân viên xác nhận
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          ← Quay lại
        </Link>
      </div>

      {/* Info Card */}
      <div className="alert alert-info border-0 shadow-sm mb-4">
        <div className="d-flex align-items-start">
          <i className="fas fa-info-circle me-3 mt-1"></i>
          <div>
            <strong>Hướng dẫn:</strong>
            <ul className="mb-0 mt-2 ps-3">
              <li>Mang theo CMND/CCCD và mã giao dịch đến quầy</li>
              <li>Nhân viên sẽ xác nhận sau khi nhận/đưa tiền mặt</li>
              <li>Số dư sẽ được cập nhật ngay sau khi xác nhận</li>
              <li>Bạn có thể hủy giao dịch nếu chưa đến quầy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pending Transactions List */}
      {pendingTransactions.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
            <h5>Không có giao dịch nào đang chờ</h5>
            <p className="text-muted mb-3">
              Tất cả giao dịch của bạn đã được xử lý
            </p>
            <Link to="/deposit" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Tạo giao dịch mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-warning text-dark">
                {pendingTransactions.length} giao dịch đang chờ
              </span>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={loadPendingTransactions}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Làm mới
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {pendingTransactions.map((tx) => {
                const isCancelling = cancellingIds.has(tx.transactionId);
                const txInfo = getTransactionInfo(tx);
                return (
                  <div key={tx.transactionId} className="list-group-item p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-warning text-dark">Chờ xử lý</span>
                          <span className={`badge ${txInfo.isWithdraw ? 'bg-danger' : 'bg-success'}`}>
                            {txInfo.isWithdraw ? 'Rút tiền' : 'Nạp tiền'}
                          </span>
                          <span className="text-muted small">
                            {formatDate(tx.timestamp)}
                          </span>
                        </div>
                        
                        <h5 className={`mb-2 ${txInfo.amountClass}`}>
                          {txInfo.amountPrefix}{formatAmount(tx.amount)} đ
                        </h5>
                        
                        {tx.transactionCode && (
                          <div className="mb-2">
                            <span className="text-muted small">Mã giao dịch: </span>
                            <code className="bg-light px-2 py-1 rounded">
                              {tx.transactionCode}
                            </code>
                          </div>
                        )}
                        
                        <p className="text-muted small mb-0">
                          <i className={`fas ${txInfo.icon} me-1`}></i>
                          {txInfo.label}
                        </p>
                      </div>
                      
                      <div className="ms-3">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancel(tx.transactionId, tx.type)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times me-1"></i>
                              Hủy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h6 className="mb-3">
            <i className="fas fa-question-circle me-2 text-primary"></i>
            Câu hỏi thường gặp
          </h6>
          <div className="accordion accordion-flush" id="faqAccordion">
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button 
                  className="accordion-button collapsed px-0" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#faq1"
                >
                  Tôi cần mang gì khi đến quầy?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body px-0 text-muted small">
                  Bạn cần mang theo CMND/CCCD và ghi nhớ mã giao dịch. Nhân viên sẽ xác minh thông tin trước khi nhận tiền.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button 
                  className="accordion-button collapsed px-0" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#faq2"
                >
                  Bao lâu thì tiền được cộng vào tài khoản?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body px-0 text-muted small">
                  Ngay sau khi nhân viên xác nhận đã nhận tiền, số dư sẽ được cập nhật tức thì vào tài khoản của bạn.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button 
                  className="accordion-button collapsed px-0" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#faq3"
                >
                  Tôi có thể hủy giao dịch không?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body px-0 text-muted small">
                  Có, bạn có thể hủy giao dịch bất cứ lúc nào trước khi nhân viên xác nhận. Sau khi xác nhận, giao dịch không thể hủy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingDeposits;
