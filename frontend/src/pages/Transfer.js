import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateAccountNumberApi } from '../api/client';

// Rebuild theo mẫu trong `Money Transfer Screen Design (1)/src/App.tsx`
const transferV2Styles = `
  :root {
    --mt-blue-50: #eff6ff;
    --mt-blue-100: #dbeafe;
    --mt-blue-600: #2563eb;
    --mt-blue-700: #1d4ed8;
    --mt-gray-50: #f8fafc;
    --mt-gray-100: #f1f5f9;
    --mt-gray-200: #e2e8f0;
    --mt-gray-300: #cbd5e1;
    --mt-gray-500: #64748b;
    --mt-gray-700: #334155;
    --mt-gray-900: #0f172a;
    --mt-green-50: #f0fdf4;
    --mt-green-200: #bbf7d0;
    --mt-green-600: #16a34a;
    --mt-red-600: #dc2626;
    --mt-radius-lg: 16px;
    --mt-radius-xl: 20px;
  }

  .transfer-v2-wrapper {
    width: 100%;
    min-height: calc(100vh - 120px);
    background: var(--mt-gray-50);
    padding: 24px 0 48px;
    align-items: flex-start !important;
  }

  .transfer-v2-shell {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    padding: 0 12px;
  }

  .transfer-v2-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .transfer-v2-back {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--mt-gray-200);
    background: #fff;
    color: var(--mt-gray-700);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .transfer-v2-back:hover {
    background: var(--mt-gray-100);
  }

  .transfer-v2-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--mt-gray-900);
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .transfer-v2-subtitle {
    margin: 2px 0 0;
    color: var(--mt-gray-500);
    font-size: 0.9rem;
  }

  .transfer-v2-balance-card {
    border-radius: var(--mt-radius-xl);
    background: linear-gradient(135deg, var(--mt-blue-600) 0%, var(--mt-blue-700) 100%);
    color: #fff;
    padding: 18px 18px 16px;
    box-shadow: 0 16px 40px rgba(37, 99, 235, 0.25);
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .transfer-v2-balance-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 45%),
      radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.08), transparent 40%);
    pointer-events: none;
  }

  .transfer-v2-balance-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .transfer-v2-balance-label {
    font-size: 0.8rem;
    opacity: 0.9;
    margin: 0 0 6px;
  }

  .transfer-v2-balance-amount {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    margin: 0;
  }

  .transfer-v2-balance-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  .transfer-v2-badges {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .transfer-v2-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 0.82rem;
    backdrop-filter: blur(8px);
  }

  .transfer-v2-card {
    background: #fff;
    border: 1px solid var(--mt-gray-200);
    border-radius: var(--mt-radius-lg);
    padding: 14px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  }

  .transfer-v2-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .transfer-v2-section-title {
    margin: 0;
    font-size: 0.78rem;
    color: var(--mt-gray-700);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
  }

  .transfer-v2-recent-list {
    display: grid;
    gap: 10px;
  }

  .transfer-v2-recent-item {
    width: 100%;
    border: 1px solid var(--mt-gray-200);
    border-radius: var(--mt-radius-lg);
    background: #fff;
    padding: 12px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    text-align: left;
    transition: all 0.15s ease;
  }

  .transfer-v2-recent-item:hover {
    border-color: #93c5fd;
    background: rgba(219, 234, 254, 0.35);
  }

  .transfer-v2-recent-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .transfer-v2-avatar {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: linear-gradient(135deg, #60a5fa, var(--mt-blue-700));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    flex: 0 0 auto;
  }

  .transfer-v2-recent-name {
    margin: 0;
    font-weight: 700;
    color: var(--mt-gray-900);
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .transfer-v2-recent-sub {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: var(--mt-gray-500);
  }

  .transfer-v2-recent-right {
    text-align: right;
    flex: 0 0 auto;
  }

  .transfer-v2-recent-right small {
    display: block;
    font-size: 0.78rem;
    color: var(--mt-gray-500);
    margin-bottom: 2px;
  }

  .transfer-v2-recent-right strong {
    color: var(--mt-gray-900);
    font-weight: 800;
    font-size: 0.9rem;
  }

  .transfer-v2-form {
    display: grid;
    gap: 12px;
  }

  .transfer-v2-field label {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--mt-gray-700);
    margin: 0 0 8px;
  }

  .transfer-v2-input,
  .transfer-v2-textarea {
    width: 100%;
    border: 1px solid var(--mt-gray-300);
    border-radius: 14px;
    padding: 12px 14px;
    background: #fff;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    color: var(--mt-gray-900);
  }

  .transfer-v2-input:focus,
  .transfer-v2-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
  }

  .transfer-v2-input:disabled,
  .transfer-v2-textarea:disabled {
    background: var(--mt-gray-100);
    cursor: not-allowed;
    color: #64748b;
  }

  .transfer-v2-amount-row {
    position: relative;
  }

  .transfer-v2-amount-suffix {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--mt-gray-500);
    font-weight: 800;
    font-size: 0.9rem;
    pointer-events: none;
  }

  .transfer-v2-amount-input {
    padding-right: 56px;
  }

  .transfer-v2-quick-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  .transfer-v2-quick-btn {
    border: 1px solid var(--mt-gray-200);
    background: #fff;
    border-radius: 12px;
    padding: 10px 8px;
    font-size: 0.85rem;
    color: var(--mt-gray-700);
    transition: all 0.15s ease;
  }

  .transfer-v2-quick-btn:hover:not(:disabled) {
    border-color: #60a5fa;
    background: rgba(219, 234, 254, 0.4);
  }

  .transfer-v2-quick-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .transfer-v2-hint {
    margin-top: 8px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--mt-gray-500);
  }

  .transfer-v2-hint-error {
    color: var(--mt-red-600);
  }

  .transfer-v2-hint-success {
    color: var(--mt-green-600);
  }

  .transfer-v2-summary {
    padding: 14px;
  }

  .transfer-v2-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--mt-gray-200);
  }

  .transfer-v2-summary-row:last-child {
    border-bottom: none;
  }

  .transfer-v2-summary-row span {
    color: var(--mt-gray-700);
    font-size: 0.92rem;
  }

  .transfer-v2-summary-row strong {
    color: var(--mt-gray-900);
    font-weight: 800;
    font-size: 0.95rem;
  }

  .transfer-v2-new-balance {
    margin-top: 10px;
    background: linear-gradient(135deg, var(--mt-blue-50), #eef2ff);
    border: 1px solid var(--mt-blue-100);
    border-radius: 14px;
    padding: 12px 12px;
  }

  .transfer-v2-new-balance span {
    color: var(--mt-gray-700);
    font-size: 0.9rem;
  }

  .transfer-v2-new-balance strong {
    font-size: 1rem;
  }

  .transfer-v2-cta {
    position: sticky;
    bottom: 0;
    padding: 12px;
    margin-top: 6px;
    border-radius: var(--mt-radius-lg);
    background: rgba(248, 250, 252, 0.92);
    border: 1px solid var(--mt-gray-200);
    backdrop-filter: blur(10px);
    display: grid;
    gap: 10px;
  }

  .transfer-v2-cta-btn {
    width: 100%;
    border: none;
    border-radius: 14px;
    padding: 14px 14px;
    font-weight: 800;
    background: var(--mt-blue-600);
    color: #fff;
    box-shadow: 0 14px 30px rgba(37, 99, 235, 0.25);
    transition: all 0.15s ease;
  }

  .transfer-v2-cta-btn:hover:not(:disabled) {
    background: var(--mt-blue-700);
    transform: translateY(-1px);
  }

  .transfer-v2-cta-btn:disabled {
    background: var(--mt-gray-200);
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }

  .transfer-v2-cta-link {
    text-align: center;
    color: var(--mt-gray-500);
    text-decoration: none;
    font-weight: 700;
    padding: 4px 0;
  }

  .transfer-v2-frozen {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .transfer-v2-frozen p {
    margin: 0;
    font-size: 0.9rem;
  }

  @media (max-width: 420px) {
    .transfer-v2-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

const formatVnd = (value) => `${Math.max(Number(value) || 0, 0).toLocaleString('vi-VN')} VND`;

const formatAccountNumber = (digits) => {
  if (!digits) return '';
  return String(digits).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const Transfer = ({ balance, onSubmit, isFrozen }) => {
  const navigate = useNavigate();
  const [receiverDigits, setReceiverDigits] = useState('');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [validatingAccount, setValidatingAccount] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const validationTimeoutRef = useRef(null);

  const recentRecipients = useMemo(
    () => [
      { account: '4532001234567890', name: 'Nguyễn Thu Hà', lastAmount: 250000 },
      { account: '4111111111111111', name: 'Trần Minh Khôi', lastAmount: 150000 },
      { account: '5500000000000004', name: 'Lê Phương Anh', lastAmount: 500000 },
    ],
    []
  );

  const quickAmounts = useMemo(() => [100000, 200000, 500000, 1000000], []);

  const amount = amountText ? Number(amountText) : 0;
  const fee = 0;
  const total = amount + fee;
  const newBalance = balance - total;

  const MIN_ACCOUNT_LEN = 10;
  const isReceiverOk = receiverDigits.length >= MIN_ACCOUNT_LEN && receiverInfo && !accountError;
  const isAmountOk = amount > 0;
  const isBalanceOk = newBalance >= 0;
  const canSubmit = isReceiverOk && isAmountOk && isBalanceOk && !isFrozen && !validatingAccount;

  // Validate account number khi người dùng nhập
  useEffect(() => {
    // Clear timeout cũ nếu có
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Reset state khi số tài khoản thay đổi
    setReceiverInfo(null);
    setAccountError(null);

    // Nếu số tài khoản đủ độ dài, validate sau 500ms (debounce)
    if (receiverDigits.length >= MIN_ACCOUNT_LEN) {
      setValidatingAccount(true);
      validationTimeoutRef.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await validateAccountNumberApi(token, receiverDigits);
          if (response && response.data) {
            setReceiverInfo({
              accountId: response.data.accountId,
              accountNumber: response.data.accountNumber,
              fullName: response.data.fullName,
              status: response.data.status,
            });
            setAccountError(null);
          }
        } catch (error) {
          setAccountError(error.message || 'Số tài khoản không tồn tại');
          setReceiverInfo(null);
        } finally {
          setValidatingAccount(false);
        }
      }, 500);
    } else if (receiverDigits.length > 0) {
      // Nếu chưa đủ độ dài nhưng đã có ký tự, không validate
      setValidatingAccount(false);
    }

    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [receiverDigits]);

  const handleReceiverChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 20);
    setReceiverDigits(digits);
  };

  const handleAmountChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAmountText(digits);
  };

  const setAmount = (value) => setAmountText(String(Math.max(Number(value) || 0, 0)));

  const selectRecipient = (recipient) => {
    setReceiverDigits(recipient.account);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiverInfo || !receiverInfo.accountId) {
      setAccountError('Vui lòng nhập số tài khoản hợp lệ');
      return;
    }
    const success = await onSubmit(receiverInfo.accountId, amount, note);
    if (success) navigate('/dashboard');
  };

  return (
    <>
      <style>{transferV2Styles}</style>
      <div className="dashboard-wrapper transfer-v2-wrapper">
        <div className="transfer-v2-shell fade-in">
          <div className="transfer-v2-header">
            <button
              type="button"
              className="transfer-v2-back"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="transfer-v2-title">Chuyển tiền</h2>
              <p className="transfer-v2-subtitle">Gửi tiền nhanh chóng &amp; an toàn</p>
            </div>
          </div>

          <div className="transfer-v2-balance-card">
            <div className="transfer-v2-balance-content">
              <div>
                <p className="transfer-v2-balance-label">Số dư khả dụng</p>
                <p className="transfer-v2-balance-amount">{formatVnd(balance)}</p>
              </div>
              <div className="transfer-v2-balance-icon" aria-hidden="true">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="transfer-v2-badges">
              <span className="transfer-v2-badge">
                <i className="fas fa-shield-alt"></i> Bảo mật
              </span>
              <span className="transfer-v2-badge">
                <i className="fas fa-bolt"></i> Chuyển nhanh
              </span>
            </div>
          </div>

          {isFrozen && (
            <div className="transfer-v2-frozen mb-3">
              <i className="fas fa-exclamation-triangle mt-1" aria-hidden="true"></i>
              <div>
                <p style={{ fontWeight: 800, marginBottom: 2 }}>Tài khoản đang bị khóa</p>
                <p>Bạn không thể thực hiện chuyển tiền cho đến khi được mở khóa.</p>
              </div>
            </div>
          )}

          {!receiverDigits && (
            <div className="transfer-v2-card mb-3">
              <div className="transfer-v2-section-head">
                <p className="transfer-v2-section-title">Người nhận gần đây</p>
                <i className="fas fa-clock" style={{ color: '#94a3b8' }} aria-hidden="true"></i>
              </div>
              <div className="transfer-v2-recent-list">
                {recentRecipients.map((r) => (
                  <button
                    key={r.account}
                    type="button"
                    className="transfer-v2-recent-item"
                    onClick={() => selectRecipient(r)}
                    disabled={isFrozen}
                  >
                    <div className="transfer-v2-recent-left">
                      <div className="transfer-v2-avatar" aria-hidden="true">
                        {r.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="transfer-v2-recent-name">{r.name}</p>
                        <p className="transfer-v2-recent-sub">****{r.account.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="transfer-v2-recent-right">
                      <small>Lần gửi trước</small>
                      <strong>{formatVnd(r.lastAmount)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="transfer-v2-form">
            <div className="transfer-v2-card transfer-v2-field">
              <label htmlFor="receiver">Số tài khoản người nhận</label>
              <input
                id="receiver"
                type="text"
                inputMode="numeric"
                className="transfer-v2-input"
                placeholder="0000 0000 0000 0000"
                value={formatAccountNumber(receiverDigits)}
                onChange={handleReceiverChange}
                disabled={isFrozen}
                autoComplete="off"
              />
              {receiverDigits.length > 0 && receiverDigits.length < MIN_ACCOUNT_LEN && (
                <div className="transfer-v2-hint transfer-v2-hint-error">
                  <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
                  <span>Vui lòng nhập tối thiểu {MIN_ACCOUNT_LEN} chữ số.</span>
                </div>
              )}
              {receiverDigits.length >= MIN_ACCOUNT_LEN && validatingAccount && (
                <div className="transfer-v2-hint">
                  <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                  <span>Đang kiểm tra số tài khoản...</span>
                </div>
              )}
              {receiverDigits.length >= MIN_ACCOUNT_LEN && !validatingAccount && accountError && (
                <div className="transfer-v2-hint transfer-v2-hint-error">
                  <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
                  <span>{accountError}</span>
                </div>
              )}
              {isReceiverOk && receiverInfo && (
                <div className="transfer-v2-hint transfer-v2-hint-success">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <span>
                    {receiverInfo.status === 'LOCKED' 
                      ? 'Tài khoản người nhận đã bị khóa' 
                      : `Người nhận: ${receiverInfo.fullName || 'Không có tên'}`}
                  </span>
                </div>
              )}
            </div>

            <div className="transfer-v2-card transfer-v2-field">
              <label htmlFor="amount">Số tiền chuyển</label>
              <div className="transfer-v2-amount-row">
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  className="transfer-v2-input transfer-v2-amount-input"
                  placeholder="0"
                  value={amountText}
                  onChange={handleAmountChange}
                  disabled={isFrozen}
                  autoComplete="off"
                />
                <span className="transfer-v2-amount-suffix">VND</span>
              </div>

              <div className="transfer-v2-quick-grid">
                {quickAmounts.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="transfer-v2-quick-btn"
                    onClick={() => setAmount(v)}
                    disabled={isFrozen}
                  >
                    {v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`}
                  </button>
                ))}
              </div>

              {isAmountOk && !isBalanceOk && (
                <div className="transfer-v2-hint transfer-v2-hint-error">
                  <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
                  <span>Số dư không đủ để thực hiện giao dịch.</span>
                </div>
              )}
            </div>

            <div className="transfer-v2-card transfer-v2-field">
              <label htmlFor="note">Ghi chú (tuỳ chọn)</label>
              <textarea
                id="note"
                rows={3}
                maxLength={100}
                className="transfer-v2-textarea"
                placeholder="Thêm ghi chú cho giao dịch này"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isFrozen}
              />
              <div className="transfer-v2-hint" style={{ justifyContent: 'flex-end' }}>
                <span>{note.length}/100</span>
              </div>
            </div>

            {isAmountOk && (
              <div className="transfer-v2-card transfer-v2-summary">
                <div className="transfer-v2-section-head" style={{ marginBottom: 8 }}>
                  <p className="transfer-v2-section-title" style={{ margin: 0 }}>
                    Tóm tắt giao dịch
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 800 }}>
                    Xem lại
                  </span>
                </div>

                <div className="transfer-v2-summary-row">
                  <span>Số tiền chuyển</span>
                  <strong>{formatVnd(amount)}</strong>
                </div>
                <div className="transfer-v2-summary-row">
                  <span>Phí giao dịch</span>
                  <strong>{formatVnd(fee)}</strong>
                </div>
                <div className="transfer-v2-summary-row">
                  <span>Tổng trừ</span>
                  <strong>{formatVnd(total)}</strong>
                </div>

                <div className="transfer-v2-new-balance">
                  <div className="transfer-v2-summary-row" style={{ borderBottom: 'none', padding: 0 }}>
                    <span>Số dư mới</span>
                    <strong style={{ color: isBalanceOk ? 'inherit' : '#dc2626' }}>
                      {formatVnd(newBalance)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="transfer-v2-cta">
              <button type="submit" className="transfer-v2-cta-btn" disabled={!canSubmit}>
                Tiếp tục chuyển tiền
              </button>
              <Link to="/dashboard" className="transfer-v2-cta-link">
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Transfer;

