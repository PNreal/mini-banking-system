import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const withdrawStyles = `
    :root {
        --withdraw-primary: #f59e0b;
        --withdraw-secondary: #d97706;
        --withdraw-light: #fef3c7;
        --withdraw-shadow: rgba(245, 158, 11, 0.4);
    }
    .withdraw-page-wrapper {
        min-height: calc(100vh - 120px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at top, #fffbeb 0%, #fdfbfb 100%);
        padding: 30px 0;
    }
    .withdraw-card {
        border-radius: 18px; border: none; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
        overflow: hidden; background: #ffffff; position: relative;
    }
    .withdraw-card::before {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 146, 60, 0.05));
        opacity: 0.35; pointer-events: none;
    }
    .withdraw-card .card-body { position: relative; z-index: 1; }
    .withdraw-icon-wrapper {
        background: linear-gradient(135deg, #fcd34d, #fbbf24);
        color: #b45309; width: 70px; height: 70px; font-size: 1.8rem;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 10px 25px rgba(251, 191, 36, 0.6);
    }
    .withdraw-balance-box {
        background: #fffbeb; border-radius: 14px; padding: 14px 18px;
        box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.3);
    }
    .withdraw-balance-box small { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; color: #92400e; }
    .withdraw-balance-box h4 { font-size: 1.3rem; color: #78350f; }
    .form-control.withdraw-amount-input {
        border-radius: 12px 0 0 12px; border-color: #e2e8f0;
        box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.25);
        transition: all 0.2s ease;
    }
    .form-control.withdraw-amount-input:focus {
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
        border-color: var(--withdraw-primary);
    }
    .withdraw-currency { border-radius: 0 12px 12px 0; background: #f9fafb !important; border-color: #e2e8f0; font-weight: 600; color: #475569; }
    .withdraw-quick-buttons { gap: 0.4rem; }
    .withdraw-quick-btn {
        border-radius: 999px; font-size: 0.8rem; padding: 0.3rem 0.8rem;
        border: 1px solid #cbd5e1; color: #475569; background: #ffffff;
        transition: all 0.18s ease;
    }
    .withdraw-quick-btn:hover {
        background: var(--withdraw-primary); color: #ffffff; border-color: var(--withdraw-secondary);
        transform: translateY(-1px); box-shadow: 0 8px 18px rgba(245, 158, 11, 0.3);
    }
    .withdraw-submit-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: none; border-radius: 12px;
        box-shadow: 0 14px 30px rgba(245, 158, 11, 0.4);
        transition: all 0.18s ease; color: white;
    }
    .withdraw-submit-btn:hover {
        filter: brightness(1.05); transform: translateY(-1px);
        box-shadow: 0 18px 35px rgba(217, 119, 6, 0.5);
    }
    .withdraw-cancel-btn { border-radius: 12px; }
    @media (max-width: 576px) { .withdraw-card .card-body { padding: 1.8rem !important; } }
`;

const Withdraw = ({ balance, onSubmit, isFrozen }) => {
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();
  const quickValues = useMemo(() => [200000, 1000000, 5000000, balance], [balance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSubmit(Number(amount));
    if (success) navigate('/');
  };

  return (
    <>
      <style>{withdrawStyles}</style>
      <div className="dashboard-wrapper withdraw-page-wrapper">
        <div className="container dashboard-container fade-in">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card dashboard-card withdraw-card">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="withdraw-icon-wrapper mx-auto mb-3">
                      <i className="fas fa-arrow-down"></i>
                    </div>
                    <h3 className="fw-bold mb-1">Rút Tiền</h3>
                    <p className="text-muted mb-0">Rút tiền về tài khoản ngân hàng liên kết</p>
                  </div>

                  <div className="withdraw-balance-box text-center mb-4">
                    <small>Số dư khả dụng</small>
                    <h4 className="mb-0 fw-bold">
                      {balance.toLocaleString('vi-VN')} VND
                    </h4>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                      <label className="form-label fw-bold" htmlFor="amount">
                        Số tiền
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          id="amount"
                          type="number"
                          className="form-control withdraw-amount-input"
                          placeholder="Nhập số tiền..."
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          required
                          disabled={isFrozen}
                        />
                        <span className="input-group-text withdraw-currency">VND</span>
                      </div>
                    </div>

                    <div className="mb-4 text-center">
                      <span className="d-block text-muted small mb-2">Chọn nhanh:</span>
                      <div className="d-flex justify-content-center flex-wrap withdraw-quick-buttons">
                        {quickValues.map((v) => (
                          <button
                            key={v}
                            type="button"
                            className="btn withdraw-quick-btn"
                            onClick={() => setAmount(String(v))}
                            disabled={isFrozen}
                          >
                            {v >= 1000000 ? `${v / 1000000} Triệu` : `${v / 1000}k`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-lg btn-block py-3 withdraw-submit-btn fw-semibold"
                        disabled={isFrozen}
                      >
                        Xác nhận
                      </button>
                      <Link to="/" className="btn btn-light btn-block py-3 withdraw-cancel-btn">
                        Hủy bỏ
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Withdraw;

