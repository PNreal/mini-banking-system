import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCountersApi } from '../api/client';

// Port UI từ prototype trong folder `rút/` (Vite/Tailwind) sang JSX + CSS thuần trong CRA.
// Lưu ý: chỉ port giao diện/UX, phần xử lý giao dịch vẫn dùng props: balance, onSubmit, isFrozen.

const withdrawPrototypeStyles = `
  .wds-page {
    width: 100%;
    min-height: calc(100vh - 120px);
    background: #f9fafb;
    border-radius: 16px;
    overflow: hidden;
  }

  .wds-shell {
    max-width: 28rem; /* gần max-w-md */
    margin: 0 auto;
    padding: 20px 16px 0;
  }

  .wds-header {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }

  .wds-header-inner {
    max-width: 28rem;
    margin: 0 auto;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wds-back-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 0;
    background: transparent;
    color: #374151;
    transition: background 0.15s ease;
  }
  .wds-back-btn:hover { background: #f3f4f6; }

  .wds-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .wds-content {
    padding-bottom: 96px; /* chừa chỗ cho CTA sticky */
  }

  .wds-balance-card {
    background: linear-gradient(135deg, #059669, #047857);
    border-radius: 18px;
    color: #ffffff;
    padding: 18px;
    box-shadow: 0 10px 18px rgba(0,0,0,0.10);
    position: relative;
    overflow: hidden;
    margin-bottom: 18px;
  }
  .wds-balance-card::before {
    content: "";
    position: absolute;
    width: 160px; height: 160px;
    border-radius: 999px;
    right: -80px; top: -80px;
    background: rgba(255,255,255,0.12);
  }
  .wds-balance-card::after {
    content: "";
    position: absolute;
    width: 120px; height: 120px;
    border-radius: 999px;
    left: -60px; bottom: -60px;
    background: rgba(255,255,255,0.06);
  }
  .wds-balance-body { position: relative; z-index: 1; }
  .wds-balance-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  .wds-balance-label { font-size: 0.85rem; color: #d1fae5; margin: 0 0 4px; }
  .wds-balance-amount { font-size: 1.8rem; font-weight: 800; margin: 0; }

  .wds-chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .wds-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(6px);
  }

  .wds-section { margin-bottom: 18px; }
  .wds-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .wds-input-wrap { position: relative; }
  .wds-input-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-weight: 700;
  }
  .wds-input {
    width: 100%;
    padding: 12px 14px 12px 44px;
    border-radius: 14px;
    border: 1px solid #d1d5db;
    outline: none;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    background: #fff;
  }
  .wds-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
  }
  .wds-input:disabled { background: #f1f5f9; cursor: not-allowed; }

  .wds-quick-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }
  .wds-quick-btn {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 10px;
    padding: 8px 6px;
    font-size: 0.82rem;
    color: #374151;
    transition: all 0.15s ease;
  }
  .wds-quick-btn:hover:not(:disabled) {
    border-color: #34d399;
    background: #ecfdf5;
  }
  .wds-quick-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .wds-hint {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.86rem;
  }
  .wds-hint-danger { color: #dc2626; }
  .wds-hint-warn { color: #d97706; }

  .wds-method-list { display: flex; flex-direction: column; gap: 10px; }
  .wds-method {
    width: 100%;
    border: 2px solid #e5e7eb;
    background: #fff;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    transition: all 0.15s ease;
  }
  .wds-method:hover { border-color: #86efac; }
  .wds-method.is-active {
    border-color: #10b981;
    background: #ecfdf5;
  }
  .wds-method-left { display: flex; align-items: center; gap: 12px; }
  .wds-method-icon {
    width: 46px; height: 46px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    color: #4b5563;
  }
  .wds-method.is-active .wds-method-icon {
    background: rgba(16,185,129,0.14);
    color: #059669;
  }
  .wds-method-title { margin: 0; font-weight: 700; color: #111827; }
  .wds-method-sub { margin: 2px 0 0; font-size: 0.8rem; color: #6b7280; }
  .wds-chevron { color: #9ca3af; }
  .wds-method.is-active .wds-chevron { color: #059669; }

  .wds-destination-list { display: flex; flex-direction: column; gap: 8px; }
  .wds-destination {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    transition: all 0.15s ease;
    text-align: left;
  }
  .wds-destination:hover { border-color: #86efac; }
  .wds-destination.is-active {
    border-color: #10b981;
    background: #ecfdf5;
  }
  .wds-destination-left { display: flex; gap: 10px; align-items: flex-start; }
  .wds-destination-icon {
    width: 22px;
    display: inline-flex;
    justify-content: center;
    margin-top: 2px;
    color: #9ca3af;
  }
  .wds-destination.is-active .wds-destination-icon { color: #059669; }
  .wds-destination-name { margin: 0; font-weight: 700; color: #111827; }
  .wds-destination-sub { margin: 4px 0 0; font-size: 0.82rem; color: #6b7280; }
  .wds-pill {
    display: inline-block;
    margin-top: 8px;
    background: #f3f4f6;
    color: #4b5563;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .wds-textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid #d1d5db;
    outline: none;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    background: #fff;
    resize: none;
  }
  .wds-textarea:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
  }
  .wds-counter { font-size: 0.75rem; color: #6b7280; text-align: right; margin-top: 6px; }

  .wds-summary {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .wds-summary-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .wds-summary-title { margin: 0; font-weight: 800; color: #111827; font-size: 0.95rem; }
  .wds-badge {
    background: #ecfdf5;
    color: #047857;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .wds-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    font-size: 0.92rem;
  }
  .wds-row span:first-child { color: #6b7280; }
  .wds-row span:last-child { color: #111827; }
  .wds-divider { border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 10px; }
  .wds-total { font-weight: 900; font-size: 1.05rem; }

  .wds-new-balance {
    margin-top: 10px;
    border: 1px solid #d1fae5;
    background: linear-gradient(90deg, #ecfdf5, #f0fdf4);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wds-cta {
    position: sticky;
    bottom: 0;
    z-index: 2;
    background: #ffffff;
    border-top: 1px solid #e5e7eb;
    padding: 12px 0 0;
    margin-top: 16px;
  }
  .wds-cta-inner {
    max-width: 28rem;
    margin: 0 auto;
    padding: 0 16px 16px;
  }
  .wds-primary-btn {
    width: 100%;
    border: 0;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 800;
    color: #ffffff;
    background: #059669;
    transition: all 0.15s ease;
    box-shadow: 0 10px 18px rgba(16,185,129,0.22);
  }
  .wds-primary-btn:hover:not(:disabled) { background: #047857; }
  .wds-primary-btn:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (max-width: 420px) {
    .wds-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

const Withdraw = ({ balance, onSubmit, isFrozen }) => {
  const navigate = useNavigate();

  // State cho quầy giao dịch
  const [counters, setCounters] = useState([]);
  const [loadingCounters, setLoadingCounters] = useState(false);

  const linkedBanks = useMemo(
    () => [
      { id: 1, name: 'Vietcombank', accountNumber: '****1234' },
      { id: 2, name: 'Techcombank', accountNumber: '****5678' },
    ],
    []
  );

  const eWallets = useMemo(
    () => [
      { id: 1, name: 'MoMo', accountNumber: '0901234567' },
      { id: 2, name: 'ZaloPay', accountNumber: '0909876543' },
    ],
    []
  );

  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(null); // 'atm' | 'bank' | 'ewallet'
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [note, setNote] = useState('');

  const numericAmount = Number(amount || 0);
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0;

  const withdrawFee = useMemo(() => {
    if (!withdrawMethod || !isAmountValid) return 0;
    if (withdrawMethod === 'atm') return 0;
    if (withdrawMethod === 'bank') return 5000;
    return 2000; // ewallet
  }, [withdrawMethod, isAmountValid]);

  const totalDeduct = isAmountValid ? numericAmount + withdrawFee : 0;
  const newBalance = balance - totalDeduct;
  const isOverBalance = isAmountValid && newBalance < 0;

  const isValidForm =
    isAmountValid &&
    newBalance >= 0 &&
    !!withdrawMethod &&
    selectedDestination !== null &&
    !isFrozen;

  const quickAmounts = useMemo(() => [200000, 500000, 1000000, 5000000], []);

  const destinations = useMemo(() => {
    if (withdrawMethod === 'atm') return counters;
    if (withdrawMethod === 'bank') return linkedBanks;
    if (withdrawMethod === 'ewallet') return eWallets;
    return [];
  }, [withdrawMethod, counters, linkedBanks, eWallets]);

  const methodName = useMemo(() => {
    if (withdrawMethod === 'atm') return 'Rút tiền tại quầy';
    if (withdrawMethod === 'bank') return 'Chuyển khoản ngân hàng';
    if (withdrawMethod === 'ewallet') return 'Ví điện tử';
    return '';
  }, [withdrawMethod]);

  const feeDescription = useMemo(() => {
    if (!withdrawMethod) return '';
    if (withdrawMethod === 'atm') return 'Miễn phí rút tại quầy';
    if (withdrawMethod === 'bank') return 'Phí chuyển khoản 5.000đ';
    return 'Phí giao dịch 2.000đ';
  }, [withdrawMethod]);

  const formatMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + ' đ';

  const handleAmountChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setAmount('');
      return;
    }
    // Chỉ cho số nguyên dương
    const sanitized = raw.replace(/[^\d]/g, '');
    setAmount(sanitized);
  };

  // Load danh sách quầy khi chọn phương thức rút tiền tại quầy
  useEffect(() => {
    if (withdrawMethod === 'atm') {
      loadCounters();
    }
  }, [withdrawMethod]);

  const loadCounters = async () => {
    setLoadingCounters(true);
    try {
      const token = localStorage.getItem('token');
      const response = await getCountersApi(token);
      if (response && response.data) {
        setCounters(response.data);
      }
    } catch (error) {
      console.error('Failed to load counters:', error);
    } finally {
      setLoadingCounters(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidForm) return;
    const success = onSubmit(totalDeduct);
    if (success) navigate('/dashboard');
  };

  return (
    <>
      <style>{withdrawPrototypeStyles}</style>

      <div className="wds-page fade-in">
        <div className="wds-header">
          <div className="wds-header-inner">
            <button
              type="button"
              className="wds-back-btn"
              onClick={() => navigate('/dashboard')}
              aria-label="Quay lại"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="wds-title">Rút tiền</h1>
          </div>
        </div>

        <div className="wds-shell wds-content">
          {/* Balance Card */}
          <div className="wds-balance-card">
            <div className="wds-balance-body">
              <div className="wds-balance-top">
                <div>
                  <p className="wds-balance-label">Số dư khả dụng</p>
                  <p className="wds-balance-amount">{formatMoney(balance)}</p>
                </div>
                <div className="wds-chip" style={{ padding: '10px 12px', borderRadius: 14 }}>
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
              <div className="wds-chip-row">
                <div className="wds-chip">
                  <i className="fas fa-shield-alt"></i>
                  <span>Bảo mật</span>
                </div>
                <div className="wds-chip">
                  <i className="fas fa-bolt"></i>
                  <span>Rút nhanh</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="wds-section">
              <label className="wds-label" htmlFor="withdraw-amount">
                Số tiền rút
              </label>
              <div className="wds-input-wrap">
                <span className="wds-input-prefix">đ</span>
                <input
                  id="withdraw-amount"
                  className="wds-input"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isFrozen}
                />
              </div>

              <div className="wds-quick-grid" aria-label="Chọn nhanh số tiền">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="wds-quick-btn"
                    onClick={() => setAmount(String(q))}
                    disabled={isFrozen}
                  >
                    {q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}k`}
                  </button>
                ))}
              </div>

              {isFrozen && (
                <div className="wds-hint wds-hint-danger">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Tài khoản đang bị khóa, không thể thực hiện giao dịch</span>
                </div>
              )}

              {!isFrozen && isAmountValid && numericAmount > balance && (
                <div className="wds-hint wds-hint-danger">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Số dư không đủ</span>
                </div>
              )}

              {!isFrozen && isOverBalance && withdrawFee > 0 && (
                <div className="wds-hint wds-hint-warn">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Tổng trừ (bao gồm phí) vượt quá số dư khả dụng</span>
                </div>
              )}
            </div>

            {/* Method */}
            <div className="wds-section">
              <div className="wds-label">Phương thức rút tiền</div>
              <div className="wds-method-list">
                <button
                  type="button"
                  className={`wds-method ${withdrawMethod === 'atm' ? 'is-active' : ''}`}
                  onClick={() => {
                    setWithdrawMethod('atm');
                    setSelectedDestination(null);
                  }}
                  disabled={isFrozen}
                >
                  <div className="wds-method-left">
                    <div className="wds-method-icon">
                      <i className="fas fa-university"></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p className="wds-method-title">Rút tiền tại quầy</p>
                      <p className="wds-method-sub">Miễn phí giao dịch</p>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-right wds-chevron`}></i>
                </button>

                <button
                  type="button"
                  className={`wds-method ${withdrawMethod === 'ewallet' ? 'is-active' : ''}`}
                  onClick={() => {
                    setWithdrawMethod('ewallet');
                    setSelectedDestination(null);
                  }}
                  disabled={isFrozen}
                >
                  <div className="wds-method-left">
                    <div className="wds-method-icon">
                      <i className="fas fa-wallet"></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p className="wds-method-title">Ví điện tử</p>
                      <p className="wds-method-sub">Phí 2.000đ</p>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-right wds-chevron`}></i>
                </button>
              </div>
            </div>

            {/* Destination */}
            {!!withdrawMethod && (
              <div className="wds-section">
                <div className="wds-label">
                  {withdrawMethod === 'atm' && 'Chọn quầy giao dịch'}
                  {withdrawMethod === 'bank' && 'Chọn tài khoản ngân hàng'}
                  {withdrawMethod === 'ewallet' && 'Chọn ví điện tử'}
                </div>
                <div className="wds-destination-list">
                  {withdrawMethod === 'atm' && (
                    loadingCounters ? (
                      <p style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Đang tải danh sách quầy...</p>
                    ) : counters.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#dc2626', padding: '1rem' }}>Không có quầy giao dịch nào khả dụng</p>
                    ) : (
                      destinations.map((counter) => (
                        <button
                          key={counter.counterId}
                          type="button"
                          className={`wds-destination ${selectedDestination === counter.counterId ? 'is-active' : ''}`}
                          onClick={() => setSelectedDestination(counter.counterId)}
                          disabled={isFrozen}
                        >
                          <div className="wds-destination-left" style={{ alignItems: 'center' }}>
                            <div className="wds-destination-icon">
                              <i className="fas fa-landmark"></i>
                            </div>
                            <div>
                              <p className="wds-destination-name">{counter.name}</p>
                              <p className="wds-destination-sub">{counter.address || 'Địa chỉ không có'}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )
                  )}

                  {withdrawMethod === 'bank' &&
                    destinations.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        className={`wds-destination ${selectedDestination === bank.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedDestination(bank.id)}
                        disabled={isFrozen}
                      >
                        <div className="wds-destination-left" style={{ alignItems: 'center' }}>
                          <div className="wds-destination-icon">
                            <i className="fas fa-landmark"></i>
                          </div>
                          <div>
                            <p className="wds-destination-name">{bank.name}</p>
                            <p className="wds-destination-sub">{bank.accountNumber}</p>
                          </div>
                        </div>
                      </button>
                    ))}

                  {withdrawMethod === 'ewallet' &&
                    destinations.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        className={`wds-destination ${selectedDestination === wallet.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedDestination(wallet.id)}
                        disabled={isFrozen}
                      >
                        <div className="wds-destination-left" style={{ alignItems: 'center' }}>
                          <div className="wds-destination-icon">
                            <i className="fas fa-wallet"></i>
                          </div>
                          <div>
                            <p className="wds-destination-name">{wallet.name}</p>
                            <p className="wds-destination-sub">{wallet.accountNumber}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Note */}
            {!!withdrawMethod && (
              <div className="wds-section">
                <label className="wds-label" htmlFor="withdraw-note">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  id="withdraw-note"
                  className="wds-textarea"
                  rows={3}
                  maxLength={100}
                  placeholder="Thêm ghi chú cho giao dịch này"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isFrozen}
                />
                <div className="wds-counter">{note.length}/100</div>
              </div>
            )}

            {/* Summary */}
            {isAmountValid && !!withdrawMethod && (
              <div className="wds-section">
                <div className="wds-summary">
                  <div className="wds-summary-head">
                    <h3 className="wds-summary-title">Tóm tắt giao dịch</h3>
                    <span className="wds-badge" title={feeDescription}>
                      Xem lại
                    </span>
                  </div>

                  <div className="wds-row">
                    <span>Số tiền rút</span>
                    <span>{formatMoney(numericAmount)}</span>
                  </div>
                  <div className="wds-row">
                    <span>Phí giao dịch</span>
                    <span>{formatMoney(withdrawFee)}</span>
                  </div>
                  <div className="wds-row">
                    <span>Phương thức</span>
                    <span>{methodName}</span>
                  </div>

                  <div className="wds-divider">
                    <div className="wds-row">
                      <span className="wds-total">Tổng trừ</span>
                      <span className="wds-total">{formatMoney(totalDeduct)}</span>
                    </div>

                    <div className="wds-new-balance">
                      <span style={{ color: '#374151', fontWeight: 700 }}>Số dư mới</span>
                      <span style={{ fontWeight: 900, color: newBalance >= 0 ? '#111827' : '#dc2626' }}>
                        {formatMoney(newBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="wds-cta" aria-label="Xác nhận rút tiền">
              <div className="wds-cta-inner">
                <button type="submit" className="wds-primary-btn" disabled={!isValidForm}>
                  Xác nhận rút tiền
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Withdraw;

