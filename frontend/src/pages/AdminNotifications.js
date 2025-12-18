import React, { useEffect, useState } from 'react';

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

const AdminNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data - sau này sẽ thay bằng API thực tế từ transaction-service
    setTimeout(() => {
      setItems([
        {
          id: 'd1',
          staffName: 'Nguyễn Văn Staff',
          staffEmail: 'staff@minibank.com',
          customerName: 'Trần Thị Khách',
          customerAccount: '000123456789',
          amount: 5000000,
          time: new Date().toISOString(),
        },
        {
          id: 'd2',
          staffName: 'Lê Thị Giao Dịch',
          staffEmail: 'staff2@minibank.com',
          customerName: 'Lê Văn B',
          customerAccount: '000987654321',
          amount: 2000000,
          time: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 400);
  }, []);

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
    <div className="container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Thông báo duyệt nạp (Admin)</h1>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {items.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
              <p className="text-muted mb-0">Chưa có khoản nạp nào được nhân viên duyệt.</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {items.map((item) => (
                <li key={item.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold mb-1">
                        Nhân viên <span className="text-primary">{item.staffName}</span> đã duyệt
                        khoản nạp cho khách hàng{' '}
                        <span className="text-success">{item.customerName}</span>
                      </div>
                      <div className="small text-muted">
                        STK khách hàng: {item.customerAccount} · Nhân viên: {item.staffEmail}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success mb-1">
                        +{formatAmount(item.amount)} đ
                      </div>
                      <small className="text-muted">{formatDate(item.time)}</small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;


