import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const depositStyles = `
    .topup-page-wrapper {
        min-height: calc(100vh - 120px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at top, #fdfbfb 0%, #ebedee 100%);
        padding: 30px 0;
    }
    .topup-card {
        border-radius: 18px;
        border: none;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
        overflow: hidden;
        background: #ffffff;
        position: relative;
    }
    .topup-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(221, 191, 56, 0.18), rgba(52, 211, 153, 0.05));
        opacity: 0.35;
        pointer-events: none;
    }
    .topup-card .card-body { position: relative; z-index: 1; }
    .topup-icon-wrapper {
        background: linear-gradient(135deg, #f6e58d, #ffd86f);
        color: #c48e19;
        width: 70px; height: 70px;
        font-size: 1.8rem; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 10px 25px rgba(245, 203, 92, 0.6);
    }
    .topup-balance-box {
        background: #f5f7fb;
        border-radius: 14px;
        padding: 14px 18px;
        box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
    }
    .topup-balance-box small { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; }
    .topup-balance-box h4 { font-size: 1.3rem; }
    .form-control.topup-amount-input {
        border-radius: 12px 0 0 12px;
        border-color: #e2e8f0;
        box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.25);
        transition: all 0.2s ease;
    }
    .form-control.topup-amount-input:focus {
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
        border-color: rgba(34, 197, 94, 0.7);
    }
    .topup-currency { border-radius: 0 12px 12px 0; background: #f9fafb !important; border-color: #e2e8f0; font-weight: 600; color: #475569; }
    .topup-quick-buttons { gap: 0.4rem; }
    .topup-quick-btn {
        border-radius: 999px; font-size: 0.8rem; padding: 0.3rem 0.8rem;
        border: 1px solid #cbd5e1; color: #475569; background: #ffffff;
        transition: all 0.18s ease;
    }
    .topup-quick-btn:hover {
        background: #22c55e; color: #ffffff; border-color: #16a34a;
        transform: translateY(-1px); box-shadow: 0 8px 18px rgba(34, 197, 94, 0.3);
    }
    .topup-submit-btn {
        background: linear-gradient(135deg, #16a34a, #22c55e);
        border: none; border-radius: 12px;
        box-shadow: 0 14px 30px rgba(34, 197, 94, 0.4);
        transition: all 0.18s ease;
    }
    .topup-submit-btn:hover {
        filter: brightness(1.03);
        transform: translateY(-1px);
        box-shadow: 0 18px 35px rgba(22, 163, 74, 0.55);
    }
    .topup-cancel-btn { border-radius: 12px; }
    @media (max-width: 576px) { .topup-card .card-body { padding: 1.8rem !important; } }
`;

const Deposit = ({ balance, onSubmit, isFrozen }) => {
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();
  const quickValues = useMemo(() => [50000, 200000, 1000000, 2000000], []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSubmit(Number(amount));
    if (success) navigate('/');
  };

  return (
    <>
      <style>{depositStyles}</style>
      <div className="dashboard-wrapper topup-page-wrapper">
        <div className="container dashboard-container fade-in">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card dashboard-card topup-card">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="topup-icon-wrapper mx-auto mb-3">
                      <i className="fas fa-plus"></i>
                    </div>
                    <h3 className="fw-bold mb-1">Nạp Tiền</h3>
                    <p className="text-muted mb-0">Nhập số tiền bạn muốn nạp vào hệ thống</p>
                  </div>

                  <div className="topup-balance-box text-center mb-4">
                    <small className="text-muted">Số dư hiện tại</small>
                    <h4 className="mb-0 fw-bold text-dark">
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
                          className="form-control topup-amount-input"
                          placeholder="Ví dụ: 500000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          required
                          disabled={isFrozen}
                        />
                        <span className="input-group-text topup-currency">VND</span>
                      </div>
                    </div>

                    <div className="mb-4 text-center">
                      <span className="d-block text-muted small mb-2">Chọn nhanh:</span>
                      <div className="d-flex justify-content-center flex-wrap topup-quick-buttons">
                        {quickValues.map((v) => (
                          <button
                            key={v}
                            type="button"
                            className="btn topup-quick-btn"
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
                        className="btn btn-success btn-lg btn-block py-3 topup-submit-btn fw-semibold"
                        disabled={isFrozen}
                      >
                        Xác nhận
                      </button>
                      <Link to="/" className="btn btn-light btn-block py-3 topup-cancel-btn">
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

export default Deposit;

