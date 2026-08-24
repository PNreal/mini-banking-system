import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMyKycStatusApi } from '../api/client';

const RequireKyc = ({ children }) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
        setKycStatus(response.data.status);
      }
    } catch (error) {
      console.error('Failed to check KYC status:', error);
      // Nếu chưa có KYC request, coi như chưa KYC
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#9333ea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Đang kiểm tra trạng thái KYC...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Nếu KYC chưa được duyệt, chuyển hướng đến trang thông báo
  if (kycStatus !== 'APPROVED') {
    return <Navigate to="/kyc-required" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireKyc;
