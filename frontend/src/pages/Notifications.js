import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi } from '../api/client';

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
    // Fetch notifications từ backend
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }

        const response = await getNotificationsApi(token, {
          page: 0,
          size: 50, // Lấy 50 thông báo gần nhất
        });

        if (response?.success && response?.data) {
          // Map dữ liệu từ backend sang format mà component expect
          const mappedNotifications = response.data.map((notif) => {
            // Giữ nguyên type từ backend (TRANSACTION_SUCCESS, ACCOUNT_CREATED, etc.)
            const typeLabel = notif.type || 'TRANSACTION_SUCCESS';

            return {
              id: notif.notificationId || notif.id || Date.now() + Math.random(),
              type: typeLabel,
              title: notif.title || 'Thông báo',
              message: notif.message || '',
              isRead: notif.readAt !== null && notif.readAt !== undefined, // Đã đọc nếu có readAt
              timestamp: notif.createdAt || notif.sentAt || new Date().toISOString(),
            };
          });

          // Sắp xếp theo thời gian mới nhất trước
          mappedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          setNotifications(mappedNotifications);
        } else {
          // Nếu không có dữ liệu, set mảng rỗng
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Nếu có lỗi, set mảng rỗng
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      await markNotificationAsReadApi(token, notificationId);
      
      // Cập nhật UI
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Vẫn cập nhật UI nếu API call thất bại
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      await markAllNotificationsAsReadApi(token);
      
      // Cập nhật UI
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Vẫn cập nhật UI nếu API call thất bại
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TRANSACTION_SUCCESS: 'fa-exchange-alt',
      TRANSACTION_FAILED: 'fa-times-circle',
      ACCOUNT_CREATED: 'fa-user-plus',
      ACCOUNT_LOCKED: 'fa-lock',
      ACCOUNT_UNLOCKED: 'fa-unlock',
      ACCOUNT_FROZEN: 'fa-snowflake',
      ACCOUNT_UNFROZEN: 'fa-sun',
      BALANCE_LOW: 'fa-exclamation-triangle',
      PAYMENT_DUE: 'fa-calendar-alt',
      SECURITY_ALERT: 'fa-shield-alt',
      SYSTEM_UPDATE: 'fa-sync-alt',
      PROMOTIONAL: 'fa-bullhorn',
      // Fallback cho các type cũ
      TRANSACTION: 'fa-exchange-alt',
      ACCOUNT_STATUS: 'fa-user-shield',
      SYSTEM_BROADCAST: 'fa-bullhorn',
    };
    return icons[type] || 'fa-bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      TRANSACTION_SUCCESS: 'text-success',
      TRANSACTION_FAILED: 'text-danger',
      ACCOUNT_CREATED: 'text-success',
      ACCOUNT_LOCKED: 'text-danger',
      ACCOUNT_UNLOCKED: 'text-success',
      ACCOUNT_FROZEN: 'text-warning',
      ACCOUNT_UNFROZEN: 'text-success',
      BALANCE_LOW: 'text-warning',
      PAYMENT_DUE: 'text-info',
      SECURITY_ALERT: 'text-warning',
      SYSTEM_UPDATE: 'text-info',
      PROMOTIONAL: 'text-primary',
      // Fallback cho các type cũ
      TRANSACTION: 'text-success',
      ACCOUNT_STATUS: 'text-info',
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






