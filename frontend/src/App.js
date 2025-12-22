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
  username: 'User',
  email: 'user@bk88.vn',
  userId: '000123456789',
  balance: 0,
  imageFile: `${process.env.PUBLIC_URL}/assets/default.jpg`,
  isFrozen: false,
};

function App() {
  const [user, setUser] = useState(initialUser);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [flashMessages, setFlashMessages] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const addFlash = (type, text) => {
    setFlashMessages((prev) => [...prev, { id: Date.now() + Math.random(), type, text }]);
  };

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
        accountNumber: accountInfo.accountNumber || null,
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

  const fetchTransactions = async (token) => {
    try {
      const response = await getTransactionsHistoryApi(token, {
        page: 0,
        size: 50,
      });

      const items = response?.data?.items || response?.data?.content || [];
      if (response?.success && items.length > 0) {
        const currentAccountId = user?.userId || user?.accountId;
        
        const mappedTransactions = items.map((tx) => {
          let typeLabel = '';
          let amount = Number(tx.amount);
          
          switch (tx.type) {
            case 'DEPOSIT':
              typeLabel = 'Nạp tiền';
              amount = Math.abs(amount);
              break;
            case 'WITHDRAW':
              typeLabel = 'Rút tiền';
              amount = -Math.abs(amount);
              break;
            case 'TRANSFER':
              const isSender = currentAccountId && tx.fromAccountId && 
                               String(tx.fromAccountId) === String(currentAccountId);
              const isReceiver = currentAccountId && tx.toAccountId && 
                                 String(tx.toAccountId) === String(currentAccountId);
              
              if (isSender) {
                typeLabel = 'Chuyển khoản';
                amount = -Math.abs(amount);
              } else if (isReceiver) {
                typeLabel = 'Nhận chuyển khoản';
                amount = Math.abs(amount);
              } else {
                typeLabel = 'Chuyển khoản';
                amount = -Math.abs(amount);
              }
              break;
            case 'COUNTER_DEPOSIT':
              typeLabel = 'Nạp tiền tại quầy';
              amount = Math.abs(amount);
              break;
            case 'COUNTER_WITHDRAW':
              typeLabel = 'Rút tiền tại quầy';
              amount = -Math.abs(amount);
              break;
            default:
              typeLabel = tx.type || 'Giao dịch';
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

        mappedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(mappedTransactions);
        return mappedTransactions;
      } else {
        setTransactions([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
        addFlash('danger', 'Không tìm thấy token đăng nhập.');
        return false;
      }

      const expectedRole = resolveRole(loginFn);
      const responseRole = data.role || data.userRole || data.user?.role;
      if (responseRole && responseRole !== expectedRole) {
        addFlash('danger', 'Sai loại tài khoản cho trang đăng nhập này.');
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

      addFlash('success', 'Đăng nhập thành công.');
      return true;
    } catch (error) {
      addFlash('danger', error.message || 'Đăng nhập thất bại.');
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

      if (response || response?.success || response?.data) {
        addFlash('success', 'Đăng ký thành công! Đang đăng nhập...');
        
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
    addFlash('info', 'Đã đăng xuất.');
  };

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
