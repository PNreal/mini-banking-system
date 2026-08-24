import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyKycStatusApi } from '../api/client';

const KycRequired = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await getMyKycStatusApi(token);
      if (response && response.data) {
        setKycStatus(response.data);
        // Nếu đã được duyệt, chuyển về trang ban đầu
        if (response.data.status === 'APPROVED') {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error('Failed to check KYC status:', error);
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!kycStatus || !kycStatus.status) {
      return {
        icon: '📝',
        title: 'Yêu cầu xác minh danh tính (KYC)',
        description: 'Bạn cần hoàn thành xác minh danh tính để sử dụng tính năng này.',
        action: 'Bắt đầu xác minh',
        actionPath: '/settings',
        color: '#3b82f6'
      };
    }

    switch (kycStatus.status) {
      case 'PENDING':
        return {
          icon: '⏳',
          title: 'Đang chờ xét duyệt KYC',
          description: 'Yêu cầu xác minh danh tính của bạn đang được xem xét. Vui lòng chờ trong ít phút.',
          action: 'Quay lại Dashboard',
          actionPath: '/dashboard',
          color: '#f59e0b'
        };
      case 'REJECTED':
        return {
          icon: '❌',
          title: 'KYC bị từ chối',
          description: kycStatus.rejectionReason || 'Yêu cầu xác minh danh tính của bạn đã bị từ chối. Vui lòng thử lại với thông tin chính xác.',
          action: 'Thử lại',
          actionPath: '/settings',
          color: '#ef4444'
        };
      default:
        return {
          icon: '📝',
          title: 'Yêu cầu xác minh danh tính (KYC)',
          description: 'Bạn cần hoàn thành xác minh danh tính để sử dụng tính năng này.',
          action: 'Bắt đầu xác minh',
          actionPath: '/settings',
          color: '#3b82f6'
        };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#9333ea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <>
      <style>{`
        .kyc-required-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .kyc-required-card {
          background: white;
          border-radius: 24px;
          padding: 48px 32px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .kyc-icon {
          font-size: 80px;
          margin-bottom: 24px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .kyc-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 16px;
          line-height: 1.2;
        }
        .kyc-description {
          font-size: 16px;
          color: #6b7280;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .kyc-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .kyc-btn {
          width: 100%;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kyc-btn-primary {
          background: ${statusInfo.color};
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .kyc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        .kyc-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .kyc-btn-secondary:hover {
          background: #e5e7eb;
        }
        .kyc-info-box {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 16px;
          margin-top: 24px;
          text-align: left;
        }
        .kyc-info-title {
          font-size: 14px;
          font-weight: 700;
          color: #0369a1;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .kyc-info-list {
          margin: 0;
          padding-left: 20px;
          color: #0c4a6e;
          font-size: 14px;
          line-height: 1.8;
        }
        @media (max-width: 640px) {
          .kyc-required-card {
            padding: 32px 24px;
          }
          .kyc-icon {
            font-size: 64px;
          }
          .kyc-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="kyc-required-page">
        <div className="kyc-required-card">
          <div className="kyc-icon">{statusInfo.icon}</div>
          <h1 className="kyc-title">{statusInfo.title}</h1>
          <p className="kyc-description">{statusInfo.description}</p>

          <div className="kyc-actions">
            <button
              className="kyc-btn kyc-btn-primary"
              onClick={() => navigate(statusInfo.actionPath)}
            >
              {statusInfo.action}
            </button>
            <button
              className="kyc-btn kyc-btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Quay lại Dashboard
            </button>
          </div>

          {(!kycStatus || !kycStatus.status) && (
            <div className="kyc-info-box">
              <div className="kyc-info-title">
                <span>ℹ️</span>
                <span>Tại sao cần xác minh?</span>
              </div>
              <ul className="kyc-info-list">
                <li>Bảo vệ tài khoản của bạn</li>
                <li>Tuân thủ quy định pháp luật</li>
                <li>Mở khóa đầy đủ tính năng</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KycRequired;
