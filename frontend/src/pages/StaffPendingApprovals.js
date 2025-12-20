import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { confirmCounterDepositApi, getStaffDashboardApi } from '../api/client';

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

const StaffPendingApprovals = ({ user }) => {
  const [stats, setStats] = useState({ pendingApprovals: 0 });
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const load = async ({ silent = false } = {}) => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    if (!silent) setRefreshing(true);
    try {
      // Backend giới hạn pendingLimit tối đa 50
      const res = await getStaffDashboardApi(authToken, { pendingLimit: 50, recentCustomersLimit: 0 });
      const data = res?.data || {};

      const statsData = data?.stats || {};
      setStats({
        pendingApprovals: Number(statsData.pendingApprovals || 0),
      });

      const pending = Array.isArray(data?.pendingApprovals) ? data.pendingApprovals : [];
      setPendingTransactions(
        pending.map((p) => ({
          id: p.transactionId,
          type: p.type === 'COUNTER_DEPOSIT' ? 'Nạp tiền' : p.type,
          customer: p.customerName,
          accountNumber: p.accountNumber,
          amount: p.amount,
          createdAt: p.createdAt,
          status: p.status,
          transactionCode: p.transactionCode,
        }))
      );
    } catch (e) {
      console.log('Failed to load pending approvals:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return pendingTransactions;
    return pendingTransactions.filter((tx) => {
      const hay = [
        tx.customer,
        tx.accountNumber,
        tx.transactionCode,
        tx.type,
        tx.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [pendingTransactions, query]);

  const handleApprove = async (txId) => {
    if (!authToken) return;
    try {
      await confirmCounterDepositApi(authToken, txId);
    } catch (e) {
      console.log('Failed to confirm counter deposit:', e);
    } finally {
      await load({ silent: true });
    }
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

  const isTruncated = stats.pendingApprovals > pendingTransactions.length;

  return (
    <div className="container admin-dashboard-container fade-in staff-dashboard">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div className="d-flex align-items-start gap-3">
              <div>
                <h1 className="h4 mb-1">Giao dịch chờ xử lý</h1>
                <div className="text-muted small">
                  Xin chào {user?.username || 'Nhân viên'} — tổng: {formatAmount(stats.pendingApprovals)}
                </div>
              </div>
              <div className="pt-1">
                <Link to="/staff/dashboard" className="btn btn-sm btn-outline-secondary">
                  ← Quay lại Dashboard
                </Link>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => load()}
              disabled={refreshing}
            >
              {refreshing ? 'Đang tải…' : 'Làm mới'}
            </button>
          </div>
        </div>
      </div>

      {isTruncated && (
        <div className="alert alert-warning py-2">
          Danh sách đang hiển thị {pendingTransactions.length}/{formatAmount(stats.pendingApprovals)} do giới hạn tải tối đa 50 trên dashboard API.
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark">
              {formatAmount(stats.pendingApprovals)} giao dịch
            </span>
            <span className="badge bg-light text-dark border">
              Hiển thị: {formatAmount(filtered.length)}
            </span>
          </div>
          <div style={{ minWidth: 280 }}>
            <input
              className="form-control form-control-sm"
              placeholder="Tìm theo khách hàng / STK / mã GD…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Khách hàng</th>
                  <th>Loại GD</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Duyệt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Không có giao dịch phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div className="fw-semibold">{tx.customer}</div>
                        <small className="text-muted">
                          STK: {tx.accountNumber}
                          {tx.transactionCode ? ` • Mã: ${tx.transactionCode}` : ''}
                        </small>
                      </td>
                      <td>{tx.type}</td>
                      <td>{tx.amount ? `${formatAmount(tx.amount)} đ` : '-'}</td>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(tx.id)}
                          disabled={refreshing}
                        >
                          Duyệt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPendingApprovals;


