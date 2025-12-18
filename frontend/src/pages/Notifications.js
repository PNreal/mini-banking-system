import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

  useEffect(() => {
    // Demo data - sẽ thay bằng API call thực tế
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'TRANSACTION',
          title: 'Giao dịch thành công',
          message: 'Bạn đã nạp tiền thành công: +1,000,000 VND',
          isRead: false,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'ACCOUNT_STATUS',
          title: 'Thay đổi trạng thái tài khoản',
          message: 'Tài khoản của bạn đã được mở khóa',
          isRead: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'SECURITY_ALERT',
          title: 'Cảnh báo bảo mật',
          message: 'Có đăng nhập từ thiết bị mới',
          isRead: true,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          type: 'TRANSACTION',
          title: 'Giao dịch thành công',
          message: 'Bạn đã chuyển khoản: -500,000 VND tới tài khoản xxx',
          isRead: true,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    // Demo - sẽ thay bằng API call thực tế
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    // Demo - sẽ thay bằng API call thực tế
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TRANSACTION: 'fa-exchange-alt',
      ACCOUNT_STATUS: 'fa-user-shield',
      SECURITY_ALERT: 'fa-shield-alt',
      SYSTEM_BROADCAST: 'fa-bullhorn',
    };
    return icons[type] || 'fa-bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      TRANSACTION: 'text-success',
      ACCOUNT_STATUS: 'text-info',
      SECURITY_ALERT: 'text-warning',
      SYSTEM_BROADCAST: 'text-primary',
    };
    return colors[type] || 'text-secondary';
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    <div className="container notifications-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2">{unreadCount} chưa đọc</span>
          )}
        </div>
        <div className="d-flex gap-2 align-items-center">
          {unreadCount > 0 && (
            <button
              className="btn btn-outline-primary btn-sm notification-action-btn"
              onClick={handleMarkAllAsRead}
            >
              <i className="fas fa-check-double me-1"></i>
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <Link 
            to="/dashboard" 
            className="btn btn-outline-secondary btn-sm notification-action-btn"
          >
            <i className="fas fa-arrow-left me-1"></i>
            Về Dashboard
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('ALL')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`btn ${filter === 'UNREAD' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('UNREAD')}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'READ' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('READ')}
            >
              Đã đọc
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell-slash fa-3x text-muted mb-3 opacity-50"></i>
              <p className="text-muted mb-0">
                {filter === 'UNREAD'
                  ? 'Không có thông báo chưa đọc'
                  : filter === 'READ'
                  ? 'Không có thông báo đã đọc'
                  : 'Không có thông báo nào'}
              </p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {filteredNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`list-group-item ${
                    !notification.isRead ? 'bg-light' : ''
                  }`}
                >
                  <div className="d-flex align-items-start">
                    <div
                      className={`notification-icon ${getNotificationColor(
                        notification.type
                      )} me-3 mt-1`}
                    >
                      <i className={`fas ${getNotificationIcon(notification.type)} fa-lg`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 fw-bold">{notification.title}</h6>
                        {!notification.isRead && (
                          <span className="badge bg-primary">Mới</span>
                        )}
                      </div>
                      <p className="mb-2 text-muted">{notification.message}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="far fa-clock me-1"></i>
                          {formatDate(notification.timestamp)}
                        </small>
                        {!notification.isRead && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <i className="fas fa-check me-1"></i>
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
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

export default Notifications;






