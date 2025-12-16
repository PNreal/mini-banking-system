import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const transferStyles = `
    :root {
        --transfer-primary: #4f46e5;
        --transfer-secondary: #4338ca;
        --transfer-light: #e0e7ff;
        --transfer-shadow: rgba(79, 70, 229, 0.4);
    }
    .transfer-page-wrapper {
        min-height: calc(100vh - 120px);
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at top, #eef2ff 0%, #f5f3ff 100%);
        padding: 30px 0;
    }
    .transfer-card {
        border-radius: 18px; border: none; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
        overflow: hidden; background: #ffffff; position: relative;
    }
    .transfer-card::before {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.05));
        opacity: 0.4; pointer-events: none;
    }
    .transfer-card .card-body { position: relative; z-index: 1; }
    .transfer-icon-wrapper {
        background: linear-gradient(135deg, #818cf8, #6366f1);
        color: white; width: 70px; height: 70px; font-size: 1.8rem;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.5);
    }
    .transfer-balance-box {
        background: #eef2ff; border-radius: 14px; padding: 14px 18px;
        border: 1px solid rgba(199, 210, 254, 0.5);
    }
    .transfer-balance-box small { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; color: #4338ca; }
    .transfer-balance-box h4 { font-size: 1.3rem; color: #312e81; }
    .form-control.transfer-input {
        border-radius: 12px; border-color: #e2e8f0;
        box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.25);
        transition: all 0.2s ease; padding: 12px 15px;
    }
    .form-control.transfer-input:focus { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25); border-color: var(--transfer-primary); }
    .input-group-text.transfer-currency { border-radius: 0 12px 12px 0; background: #f8fafc; border-color: #e2e8f0; color: #64748b; font-weight: 600; }
    .form-control.amount-input { border-radius: 12px 0 0 12px; }
    .transfer-submit-btn {
        background: linear-gradient(135deg, #4f46e5, #4338ca);
        border: none; border-radius: 12px;
        box-shadow: 0 14px 30px rgba(79, 70, 229, 0.3);
        transition: all 0.18s ease; color: white;
    }
    .transfer-submit-btn:hover {
        filter: brightness(1.1); transform: translateY(-1px);
        box-shadow: 0 18px 35px rgba(67, 56, 202, 0.4);
    }
    .transfer-cancel-btn { border-radius: 12px; }
    .quick-amount-badge {
        cursor: pointer; transition: all 0.2s;
        border: 1px solid #e0e7ff; color: #6366f1;
    }
    .quick-amount-badge:hover { background: #e0e7ff; transform: translateY(-2px); }
`;

const Transfer = ({ balance, onSubmit, isFrozen }) => {
  const [form, setForm] = useState({ receiver: '', amount: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSubmit(form.receiver, Number(form.amount));
    if (success) navigate('/');
  };

  const setAmount = (value) => setForm((prev) => ({ ...prev, amount: String(value) }));

  return (
    <>
      <style>{transferStyles}</style>
      <div className="dashboard-wrapper transfer-page-wrapper">
        <div className="container dashboard-container fade-in">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card dashboard-card transfer-card">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="transfer-icon-wrapper mx-auto mb-3">
                      <i className="fas fa-paper-plane"></i>
                    </div>
                    <h3 className="fw-bold mb-1">Chuyển Khoản</h3>
                    <p className="text-muted mb-0">Gửi tiền nhanh chóng &amp; an toàn</p>
                  </div>

                  <div className="transfer-balance-box text-center mb-4">
                    <small>Số dư khả dụng</small>
                    <h4 className="mb-0 fw-bold">{balance.toLocaleString('vi-VN')} VND</h4>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold text-secondary" htmlFor="receiver">
                        Số tài khoản người nhận
                      </label>
                      <input
                        id="receiver"
                        className="form-control transfer-input"
                        placeholder="Nhập số tài khoản người nhận"
                        value={form.receiver}
                        onChange={(e) => setForm((prev) => ({ ...prev, receiver: e.target.value }))}
                        required
                        disabled={isFrozen}
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label fw-bold text-secondary" htmlFor="amount">
                        Số tiền
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          id="amount"
                          type="number"
                          className="form-control transfer-input amount-input"
                          placeholder="Nhập số tiền..."
                          value={form.amount}
                          onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                          min="0"
                          required
                          disabled={isFrozen}
                        />
                        <span className="input-group-text transfer-currency">VND</span>
                      </div>

                      <div className="d-flex gap-2 mt-2 justify-content-end">
                        {[100000, 500000, 1000000].map((v) => (
                          <span
                            key={v}
                            className="badge bg-white quick-amount-badge rounded-pill py-2 px-3 shadow-sm"
                            onClick={() => setAmount(v)}
                            role="button"
                          >
                            {v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid gap-2 pt-2">
                      <button
                        type="submit"
                        className="btn btn-lg btn-block py-3 transfer-submit-btn fw-bold"
                        disabled={isFrozen}
                      >
                        Xác nhận
                      </button>
                      <Link to="/" className="btn btn-light btn-block py-3 transfer-cancel-btn text-muted">
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

export default Transfer;

