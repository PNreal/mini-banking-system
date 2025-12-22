import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ExternalRedirect from './components/ExternalRedirect';
import RequireKyc from './components/RequireKyc';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transfer from './pages/Transfer';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import StaffDashboard from './pages/StaffDashboard';
import StaffPendingApprovals from './pages/StaffPendingApprovals';
import CounterAdminDashboard from './pages/CounterAdminDashboard';
import StaffLogin from './pages/StaffLogin';
import StaffSettings from './pages/StaffSettings';
import Notifications from './pages/Notifications';
import KycRequired from './pages/KycRequired';
import PendingDeposits from './pages/PendingDeposits';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import './App.css';
import { loginApi, loginStaffApi, registerApi, getAccountInfoApi, getUserInfoApi, depositApi, withdrawApi, transferApi, getTransactionsHistoryApi } from './api/client';

const initialUser = {
  username: 'User', // TÃƒÂªn mÃ¡ÂºÂ·c Ã„Â‘Ã¡Â»Â‹nh, sÃ¡ÂºÂ½ Ã„Â‘Ã†Â°Ã¡Â»Â£c thay thÃ¡ÂºÂ¿ bÃ¡ÂºÂ±ng tÃƒÂªn tÃ¡Â»Â« backend
  email: 'user@bk88.vn',
  userId: '000123456789',
  balance: 0, // SÃ¡Â»Â‘ dÃ†Â° mÃ¡ÂºÂ·c Ã„Â‘Ã¡Â»Â‹nh lÃƒÂ  0 khi chÃ†Â°a fetch Ã„Â‘Ã†Â°Ã¡Â»Â£c tÃ¡Â»Â« backend
  imageFile: `${process.env.PUBLIC_URL}/assets/default.jpg`,
  isFrozen: false,
};

function App() {
  const [user, setUser] = useState(initialUser);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'ADMIN', 'STAFF', 'CUSTOMER'
  const [flashMessages, setFlashMessages] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const addFlash = (type, text) => {
    setFlashMessages((prev) => [...prev, { id: Date.now() + Math.random(), type, text }]);
  };

  // HÃƒÂ m fetch thÃƒÂ´ng tin user vÃƒÂ  account tÃ¡Â»Â« backend
  const fetchUserData = async (token) => {
    try {
      const [accountResult, userResult] = await Promise.allSettled([
        getAccountInfoApi(token),
        getUserInfoApi(token),
      ]);

      const accountData = accountResult.status === 'fulfilled' ? accountResult.value : null;
      const accountInfo = accountData?.data || {};

      const userData = userResult.status === 'fulfilled' ? userResult.value : null;
      const userInfo = userData?.data || {};

      return {
        balance: accountInfo.balance || 0,
        userId: accountInfo.accountId || userInfo.userId || userInfo.accountId || '',
        accountNumber: accountInfo.accountNumber || null, // Sá»‘ tÃ i khoáº£n chá»‰ cÃ³ khi KYC Ä‘Æ°á»£c approve
        isFrozen: accountInfo.status === 'FROZEN',
        status: accountInfo.status || 'ACTIVE',
        username: userInfo.fullName || userInfo.username || 'User',
        email: userInfo.email || '',
        imageFile: userInfo.imageFile || `${process.env.PUBLIC_URL}/assets/default.jpg`,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // HÃƒÂ m fetch lÃ¡Â»Â‹ch sÃ¡Â»Â­ giao dÃ¡Â»Â‹ch tÃ¡Â»Â« backend
  const fetchTransactions = async (token) => {
    try {
      const response = await getTransactionsHistoryApi(token, {
        page: 0,
        size: 50, // LÃ¡ÂºÂ¥y 50 giao dÃ¡Â»Â‹ch gÃ¡ÂºÂ§n nhÃ¡ÂºÂ¥t
      });

      // Backend trả về PagedResponse với field 'items' (không phải 'content')
      const items = response?.data?.items || response?.data?.content || [];
      if (response?.success && items.length > 0) {
        // LÃ¡ÂºÂ¥y accountId cÃ¡Â»Â§a user hiÃ¡Â»Â‡n tÃ¡ÂºÂ¡i Ã„Â‘Ã¡Â»Âƒ xÃƒÂ¡c Ã„Â‘Ã¡Â»Â‹nh giao dÃ¡Â»Â‹ch gÃ¡Â»Â­i/nhÃ¡ÂºÂ­n
        const currentAccountId = user?.userId || user?.accountId;
        
        // Map dÃ¡Â»Â¯ liÃ¡Â»Â‡u tÃ¡Â»Â« backend sang format mÃƒÂ  Dashboard component expect
        const mappedTransactions = items.map((tx) => {
          // Map transaction type sang tiÃ¡ÂºÂ¿ng ViÃ¡Â»Â‡t
          let typeLabel = '';
          let amount = Number(tx.amount);
          
          switch (tx.type) {
            case 'DEPOSIT':
              typeLabel = 'NÃ¡ÂºÂ¡p tiÃ¡Â»Ân';
              amount = Math.abs(amount); // DÃ†Â°Ã†Â¡ng
              break;
            case 'WITHDRAW':
              typeLabel = 'RÃƒÂºt tiÃ¡Â»Ân';
              amount = -Math.abs(amount); // ÃƒÂ‚m
              break;
            case 'TRANSFER':
              // XÃƒÂ¡c Ã„Â‘Ã¡Â»Â‹nh xem user lÃƒÂ  ngÃ†Â°Ã¡Â»Âi gÃ¡Â»Â­i hay ngÃ†Â°Ã¡Â»Âi nhÃ¡ÂºÂ­n
              const isSender = currentAccountId && tx.fromAccountId && 
                               String(tx.fromAccountId) === String(currentAccountId);
              const isReceiver = currentAccountId && tx.toAccountId && 
                                 String(tx.toAccountId) === String(currentAccountId);
              
              if (isSender) {
                typeLabel = 'ChuyÃ¡Â»Âƒn khoÃ¡ÂºÂ£n';
                amount = -Math.abs(amount); // ÃƒÂ‚m (gÃ¡Â»Â­i Ã„Â‘i)
              } else if (isReceiver) {
                typeLabel = 'NhÃ¡ÂºÂ­n chuyÃ¡Â»Âƒn khoÃ¡ÂºÂ£n';
                amount = Math.abs(amount); // DÃ†Â°Ã†Â¡ng (nhÃ¡ÂºÂ­n vÃ¡Â»Â)
              } else {
                typeLabel = 'ChuyÃ¡Â»Âƒn khoÃ¡ÂºÂ£n';
                amount = -Math.abs(amount); // MÃ¡ÂºÂ·c Ã„Â‘Ã¡Â»Â‹nh coi nhÃ†Â° gÃ¡Â»Â­i Ã„Â‘i
              }
              break;
            case 'COUNTER_DEPOSIT':
              typeLabel = 'NÃ¡ÂºÂ¡p tiÃ¡Â»Ân tÃ¡ÂºÂ¡i quÃ¡ÂºÂ§y';
              amount = Math.abs(amount); // DÃ†Â°Ã†Â¡ng
              break;
            default:
              typeLabel = tx.type || 'Giao dÃ¡Â»Â‹ch';
          }

          return {
            id: tx.transactionId || tx.id || Date.now() + Math.random(),
            type: typeLabel,
            amount: amount,
            date: tx.timestamp || tx.date || new Date().toISOString(),
            status: tx.status,
            transactionCode: tx.transactionCode,
            transactionId: tx.transactionId,
          };
        });

        // SÃ¡ÂºÂ¯p xÃ¡ÂºÂ¿p theo thÃ¡Â»Âi gian mÃ¡Â»Â›i nhÃ¡ÂºÂ¥t trÃ†Â°Ã¡Â»Â›c
        mappedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(mappedTransactions);
        return mappedTransactions;
      } else {
        // NÃ¡ÂºÂ¿u khÃƒÂ´ng cÃƒÂ³ dÃ¡Â»Â¯ liÃ¡Â»Â‡u, set mÃ¡ÂºÂ£ng rÃ¡Â»Â—ng
        setTransactions([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // NÃ¡ÂºÂ¿u cÃƒÂ³ lÃ¡Â»Â—i, giÃ¡Â»Â¯ nguyÃƒÂªn transactions hiÃ¡Â»Â‡n tÃ¡ÂºÂ¡i hoÃ¡ÂºÂ·c set mÃ¡ÂºÂ£ng rÃ¡Â»Â—ng
      setTransactions([]);
      return [];
    }
  };

  const persistSession = (token, role, storedUser, remember = false) => {
    try {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('user', JSON.stringify(storedUser));

      if (remember) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('user', JSON.stringify(storedUser));
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error('Error persisting session:', e);
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  };

  const resolveRole = (loginFn) => {
    if (loginFn === loginStaffApi) return 'STAFF';
    return 'CUSTOMER';
  };

  const doLogin = async (form, loginFn) => {
    try {
      const response = await loginFn({
        email: form.email,
        password: form.password,
      });

      const data = response?.data || response || {};
      const token = data.token || data.accessToken || data.jwt;
      if (!token) {
        addFlash('danger', 'Khong tim thay token dang nhap.');
        return false;
      }

      const expectedRole = resolveRole(loginFn);
      const responseRole = data.role || data.userRole || data.user?.role;
      if (responseRole && responseRole !== expectedRole) {
        addFlash('danger', 'Sai loai tai khoan cho trang dang nhap nay.');
        return false;
      }
      let nextUser = {
        ...initialUser,
        role: expectedRole,
        email: form.email || '',
        userId: data.userId || '',
      };

      if (expectedRole === 'CUSTOMER') {
        const fetchedUser = await fetchUserData(token);
        if (fetchedUser) {
          nextUser = { ...nextUser, ...fetchedUser };
        }
      }

      setUser(nextUser);
      setAuthToken(token);
      setUserRole(expectedRole);
      setIsAuthenticated(true);
      persistSession(token, expectedRole, nextUser, !!form.remember);

      if (expectedRole === 'CUSTOMER') {
        await fetchTransactions(token);
      }

      addFlash('success', 'Dang nhap thanh cong.');
      return true;
    } catch (error) {
      addFlash('danger', error.message || 'Dang nhap that bai.');
      return false;
    }
  };

  const restoreSession = async () => {
    try {
      const storedToken =
        sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const storedRole =
        sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
      const storedUserRaw =
        sessionStorage.getItem('user') || localStorage.getItem('user');

      if (!storedToken || !storedRole) {
        clearSession();
        setIsAuthenticated(false);
        return;
      }

      setAuthToken(storedToken);
      setUserRole(storedRole);
      setIsAuthenticated(true);

      if (storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw);
          setUser((prev) => ({ ...prev, ...storedUser, role: storedRole }));
        } catch (e) {
          clearSession();
        }
      }

      if (storedRole === 'CUSTOMER') {
        const fetchedUser = await fetchUserData(storedToken);
        if (fetchedUser) {
          setUser((prev) => ({ ...prev, ...fetchedUser, role: storedRole }));
        }
        await fetchTransactions(storedToken);
      } else {
        setUser((prev) => ({ ...prev, role: storedRole }));
      }
    } catch (e) {
      console.error('Error restoring session:', e);
      clearSession();
      setIsAuthenticated(false);
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const handleLogin = async (form) => {
    return doLogin(form, loginApi);
  };

  const handleStaffLogin = async (form) => {
    return doLogin(form, loginStaffApi);
  };

  const handleRegister = async (form) => {
    try {
      const response = await registerApi({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      // Backend trả về string "User registered successfully." khi thành công
      if (response || response?.success || response?.data) {
        addFlash('success', 'Đăng ký thành công! Đang đăng nhập...');
        
        // Tự động đăng nhập sau khi đăng ký thành công
        const loginSuccess = await handleLogin({
          email: form.email,
          password: form.password,
        });
        
        return loginSuccess;
      }

      addFlash('danger', 'Đăng ký thất bại.');
      return false;
    } catch (error) {
      addFlash('danger', error.message || 'Đăng ký thất bại.');
      return false;
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setUser(initialUser);
    setTransactions([]);
    addFlash('info', 'Da dang xuat.');
  };

  // Helper functions for role checking
  const isAdmin = userRole === 'ADMIN';
  const isStaff = userRole === 'STAFF';
  const isCustomer = userRole === 'CUSTOMER';

  const ADMIN_UI_BASE =
    process.env.REACT_APP_ADMIN_UI_URL || 'http://localhost:3001';

  const updateBalance = (delta, typeLabel) => {
    setUser((prev) => ({ ...prev, balance: Math.max(prev.balance + delta, 0) }));
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: typeLabel,
        amount: delta,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeposit = async (amount) => {
    if (!amount || amount <= 0) {
      addFlash('danger', 'SÃ¡Â»Â‘ tiÃ¡Â»Ân khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»Â‡.');
      return false;
    }

    const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      addFlash('danger', 'PhiÃƒÂªn Ã„Â‘Ã„Âƒng nhÃ¡ÂºÂ­p Ã„Â‘ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n. Vui lÃƒÂ²ng Ã„Â‘Ã„Âƒng nhÃ¡ÂºÂ­p lÃ¡ÂºÂ¡i.');
      return false;
    }

    try {
      const response = await depositApi(token, amount);
      
      if (response?.success && response?.data) {
        const newBalance = response.data.newBalance || user.balance + amount;
        // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t balance trong user state
        setUser((prev) => ({
          ...prev,
          balance: newBalance,
        }));
        
        // ThÃƒÂªm transaction vÃƒÂ o lÃ¡Â»Â‹ch sÃ¡Â»Â­
        updateBalance(amount, 'NÃ¡ÂºÂ¡p tiÃ¡Â»Ân');
        
        // Refresh transactions tÃ¡Â»Â« backend
        await fetchTransactions(token);
        
        addFlash('success', `NÃ¡ÂºÂ¡p tiÃ¡Â»Ân thÃƒÂ nh cÃƒÂ´ng. SÃ¡Â»Â‘ dÃ†Â° mÃ¡Â»Â›i: ${newBalance.toLocaleString('vi-VN')} VND`);
        return true;
      } else {
        addFlash('danger', 'NÃ¡ÂºÂ¡p tiÃ¡Â»Ân thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i. Vui lÃƒÂ²ng thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.');
        return false;
      }
    } catch (error) {
      console.error('Error depositing:', error);
      let errorMessage = 'NÃ¡ÂºÂ¡p tiÃ¡Â»Ân thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.';
      
      if (error.message) {
        if (error.message.includes('ACCOUNT_FROZEN')) {
          errorMessage = 'TÃƒÂ i khoÃ¡ÂºÂ£n Ã„Â‘ang bÃ¡Â»Â‹ khÃƒÂ³a. KhÃƒÂ´ng thÃ¡Â»Âƒ thÃ¡Â»Â±c hiÃ¡Â»Â‡n giao dÃ¡Â»Â‹ch.';
        } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
          errorMessage = 'SÃ¡Â»Â‘ dÃ†Â° khÃƒÂ´ng Ã„Â‘Ã¡Â»Â§.';
        } else if (error.message.includes('INVALID_AMOUNT')) {
          errorMessage = 'SÃ¡Â»Â‘ tiÃ¡Â»Ân khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»Â‡.';
        } else {
          errorMessage = error.message;
        }
      }
      
      addFlash('danger', errorMessage);
      return false;
    }
  };

  const handleWithdraw = async (amount) => {
    if (!amount || amount <= 0) {
      addFlash('danger', 'Số tiền không hợp lệ.');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'Số dư không đủ.');
      return false;
    }

    try {
      const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await withdrawApi(token, amount);
      if (response && response.data) {
        // Cập nhật số dư từ response
        const newBalance = response.data.newBalance;
        setUser((prev) => ({ ...prev, balance: newBalance }));
        
        // Refresh transactions từ backend
        await fetchTransactions(token);
        
        addFlash('success', 'Rút tiền thành công.');
        return true;
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      let errorMessage = 'Rút tiền thất bại.';

      if (error.message) {
        if (error.message.includes('ACCOUNT_FROZEN')) {
          errorMessage = 'Tài khoản đang bị khóa. Không thể thực hiện giao dịch.';
        } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
          errorMessage = 'Số dư không đủ.';
        } else if (error.message.includes('INVALID_AMOUNT')) {
          errorMessage = 'Số tiền không hợp lệ.';
        } else {
          errorMessage = error.message;
        }
      }
      addFlash('danger', errorMessage);
      return false;
    }
    return false;
  };

  const handleTransfer = async (toAccountId, amount, note) => {
    if (!toAccountId) {
      addFlash('danger', 'Vui lÃƒÂ²ng nhÃ¡ÂºÂ­p sÃ¡Â»Â‘ tÃƒÂ i khoÃ¡ÂºÂ£n ngÃ†Â°Ã¡Â»Âi nhÃ¡ÂºÂ­n.');
      return false;
    }
    if (!amount || amount <= 0) {
      addFlash('danger', 'SÃ¡Â»Â‘ tiÃ¡Â»Ân khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»Â‡.');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'SÃ¡Â»Â‘ dÃ†Â° khÃƒÂ´ng Ã„Â‘Ã¡Â»Â§.');
      return false;
    }

    try {
      const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await transferApi(token, toAccountId, amount, note);
      if (response && response.data) {
        // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t sÃ¡Â»Â‘ dÃ†Â° tÃ¡Â»Â« response
        const newBalance = response.data.newBalance;
        setUser((prev) => ({ ...prev, balance: newBalance }));
        
        // Refresh transactions tÃ¡Â»Â« backend
        await fetchTransactions(token);
        
        addFlash('success', 'ChuyÃ¡Â»Âƒn khoÃ¡ÂºÂ£n thÃƒÂ nh cÃƒÂ´ng.');
        return true;
      }
    } catch (error) {
      addFlash('danger', error.message || 'ChuyÃ¡Â»Âƒn khoÃ¡ÂºÂ£n thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i. Vui lÃƒÂ²ng thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.');
      return false;
    }
    return false;
  };

  const handleUpdateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    addFlash('success', 'CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t hÃ¡Â»Â“ sÃ†Â¡ (demo).');
  };

  const handleChangePassword = () => {
    addFlash('success', 'Ã„ÂÃ¡Â»Â•i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u (demo).');
  };

  const handleForgotPassword = (email) => {
    addFlash('info', `Ã„ÂÃƒÂ£ gÃ¡Â»Â­i email khÃƒÂ´i phÃ¡Â»Â¥c tÃ¡Â»Â›i ${email} (demo).`);
  };

  const handleResetPassword = () => {
    addFlash('success', 'Ã„ÂÃ¡ÂºÂ·t lÃ¡ÂºÂ¡i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u (demo).');
  };

  const handleFreezeToggle = () => {
    setUser((prev) => ({ ...prev, isFrozen: !prev.isFrozen }));
    addFlash('info', 'Ã„ÂÃƒÂ£ chuyÃ¡Â»Âƒn trÃ¡ÂºÂ¡ng thÃƒÂ¡i tÃƒÂ i khoÃ¡ÂºÂ£n (demo).');
  };

  if (!isAuthReady) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Dang tai...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        user={user}
        flashMessages={flashMessages}
        onDismissFlash={(id) =>
          setFlashMessages((prev) => prev.filter((msg) => msg.id !== id))
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isAdmin ? <Navigate to="/admin" replace /> :
                isStaff ? <Navigate to="/staff/dashboard" replace /> :
                <Navigate to="/dashboard" replace />
              ) : (
                <Home />
              )
            }
          />
          {/* Admin UI Ä‘Ã£ tÃ¡ch sang app riÃªng (banking-admin-hub-main) */}
          <Route path="/admin/*" element={<ExternalRedirect baseUrl={ADMIN_UI_BASE} />} />
          <Route
            path="/counter/admin"
            element={
              isAuthenticated && isStaff ? (
                <Navigate to="/counter/admin/dashboard" replace />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated && isCustomer ? (
                <Dashboard
                  user={user}
                  transactions={transactions}
                  onFreezeToggle={handleFreezeToggle}
                />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/transactions"
            element={
              isAuthenticated && isCustomer ? (
                <Transactions transactions={transactions} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          {/* route admin/login chuyá»ƒn hÆ°á»›ng qua app admin má»›i */}
          <Route path="/admin/login" element={<ExternalRedirect baseUrl={ADMIN_UI_BASE} />} />
          <Route path="/staff/login" element={<StaffLogin onLogin={handleStaffLogin} />} />
          <Route path="/staff" element={<Navigate to="/staff/login" replace />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route
            path="/deposit"
            element={
              isAuthenticated && isCustomer ? (
                <RequireKyc>
                  <Deposit balance={user.balance} onSubmit={handleDeposit} isFrozen={user.isFrozen} />
                </RequireKyc>
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/withdraw"
            element={
              isAuthenticated && isCustomer ? (
                <RequireKyc>
                  <Withdraw balance={user.balance} onSubmit={handleWithdraw} isFrozen={user.isFrozen} />
                </RequireKyc>
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/transfer"
            element={
              isAuthenticated && isCustomer ? (
                <RequireKyc>
                  <Transfer balance={user.balance} onSubmit={handleTransfer} isFrozen={user.isFrozen} />
                </RequireKyc>
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/kyc-required" element={<KycRequired />} />
          <Route
            path="/settings"
            element={
              isAuthenticated && isCustomer ? (
                <Settings user={user} onUpdate={handleUpdateProfile} />
              ) : isAuthenticated && isStaff ? (
                <StaffSettings user={user} onUpdate={handleUpdateProfile} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/change-password" element={<ChangePassword onSubmit={handleChangePassword} />} />
          <Route path="/forgot-password" element={<ForgotPassword onSubmit={handleForgotPassword} />} />
          <Route path="/reset-password" element={<ResetPassword onSubmit={handleResetPassword} />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/notifications"
            element={
              isAuthenticated && isCustomer ? (
                <Notifications user={user} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/pending-deposits"
            element={
              isAuthenticated && isCustomer ? (
                <RequireKyc>
                  <PendingDeposits 
                    user={user} 
                    onTransactionUpdate={() => {
                      const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                      if (token) {
                        fetchTransactions(token);
                        fetchUserData(token).then(data => {
                          if (data) setUser(prev => ({ ...prev, ...data }));
                        });
                      }
                    }}
                  />
                </RequireKyc>
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              isAuthenticated && isStaff ? (
                <StaffDashboard user={user} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            }
          />
          <Route
            path="/staff/pending-approvals"
            element={
              isAuthenticated && isStaff ? (
                <StaffPendingApprovals user={user} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            }
          />
          <Route
            path="/counter/admin/dashboard"
            element={
              isAuthenticated && isStaff ? (
                <CounterAdminDashboard user={user} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/staff/login" replace />
              )
            }
          />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

