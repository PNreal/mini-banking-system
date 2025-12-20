import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ExternalRedirect from './components/ExternalRedirect';
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
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import './App.css';
import { loginApi, loginStaffApi, registerApi, getAccountInfoApi, getUserInfoApi, depositApi, transferApi, getTransactionsHistoryApi } from './api/client';

const initialUser = {
  username: 'User', // TÃªn máº·c Äá»nh, sáº½ ÄÆ°á»£c thay tháº¿ báº±ng tÃªn tá»« backend
  email: 'user@bk88.vn',
  userId: '000123456789',
  balance: 0, // Sá» dÆ° máº·c Äá»nh lÃ  0 khi chÆ°a fetch ÄÆ°á»£c tá»« backend
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

  // HÃ m fetch thÃ´ng tin user vÃ  account tá»« backend
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

  // HÃ m fetch lá»ch sá»­ giao dá»ch tá»« backend
  const fetchTransactions = async (token) => {
    try {
      const response = await getTransactionsHistoryApi(token, {
        page: 0,
        size: 50, // Láº¥y 50 giao dá»ch gáº§n nháº¥t
      });

      if (response?.success && response?.data?.content) {
        // Láº¥y accountId cá»§a user hiá»n táº¡i Äá» xÃ¡c Äá»nh giao dá»ch gá»­i/nháº­n
        const currentAccountId = user?.userId || user?.accountId;
        
        // Map dá»¯ liá»u tá»« backend sang format mÃ  Dashboard component expect
        const mappedTransactions = response.data.content.map((tx) => {
          // Map transaction type sang tiáº¿ng Viá»t
          let typeLabel = '';
          let amount = Number(tx.amount);
          
          switch (tx.type) {
            case 'DEPOSIT':
              typeLabel = 'Náº¡p tiá»n';
              amount = Math.abs(amount); // DÆ°Æ¡ng
              break;
            case 'WITHDRAW':
              typeLabel = 'RÃºt tiá»n';
              amount = -Math.abs(amount); // Ãm
              break;
            case 'TRANSFER':
              // XÃ¡c Äá»nh xem user lÃ  ngÆ°á»i gá»­i hay ngÆ°á»i nháº­n
              const isSender = currentAccountId && tx.fromAccountId && 
                               String(tx.fromAccountId) === String(currentAccountId);
              const isReceiver = currentAccountId && tx.toAccountId && 
                                 String(tx.toAccountId) === String(currentAccountId);
              
              if (isSender) {
                typeLabel = 'Chuyá»n khoáº£n';
                amount = -Math.abs(amount); // Ãm (gá»­i Äi)
              } else if (isReceiver) {
                typeLabel = 'Nháº­n chuyá»n khoáº£n';
                amount = Math.abs(amount); // DÆ°Æ¡ng (nháº­n vá»)
              } else {
                typeLabel = 'Chuyá»n khoáº£n';
                amount = -Math.abs(amount); // Máº·c Äá»nh coi nhÆ° gá»­i Äi
              }
              break;
            case 'COUNTER_DEPOSIT':
              typeLabel = 'Náº¡p tiá»n táº¡i quáº§y';
              amount = Math.abs(amount); // DÆ°Æ¡ng
              break;
            default:
              typeLabel = tx.type || 'Giao dá»ch';
          }

          return {
            id: tx.transactionId || tx.id || Date.now() + Math.random(),
            type: typeLabel,
            amount: amount,
            date: tx.timestamp || tx.date || new Date().toISOString(),
          };
        });

        // Sáº¯p xáº¿p theo thá»i gian má»i nháº¥t trÆ°á»c
        mappedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(mappedTransactions);
        return mappedTransactions;
      } else {
        // Náº¿u khÃ´ng cÃ³ dá»¯ liá»u, set máº£ng rá»ng
        setTransactions([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Náº¿u cÃ³ lá»i, giá»¯ nguyÃªn transactions hiá»n táº¡i hoáº·c set máº£ng rá»ng
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
        username: form.username,
        email: form.email,
        password: form.password,
      });

      if (response?.success || response?.data) {
        addFlash('success', 'Dang ky thanh cong. Vui long dang nhap.');
        return true;
      }

      addFlash('danger', 'Dang ky that bai.');
      return false;
    } catch (error) {
      addFlash('danger', error.message || 'Dang ky that bai.');
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
      addFlash('danger', 'Sá» tiá»n khÃ´ng há»£p lá».');
      return false;
    }

    const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      addFlash('danger', 'PhiÃªn ÄÄng nháº­p ÄÃ£ háº¿t háº¡n. Vui lÃ²ng ÄÄng nháº­p láº¡i.');
      return false;
    }

    try {
      const response = await depositApi(token, amount);
      
      if (response?.success && response?.data) {
        const newBalance = response.data.newBalance || user.balance + amount;
        // Cáº­p nháº­t balance trong user state
        setUser((prev) => ({
          ...prev,
          balance: newBalance,
        }));
        
        // ThÃªm transaction vÃ o lá»ch sá»­
        updateBalance(amount, 'Náº¡p tiá»n');
        
        // Refresh transactions tá»« backend
        await fetchTransactions(token);
        
        addFlash('success', `Náº¡p tiá»n thÃ nh cÃ´ng. Sá» dÆ° má»i: ${newBalance.toLocaleString('vi-VN')} VND`);
        return true;
      } else {
        addFlash('danger', 'Náº¡p tiá»n tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
        return false;
      }
    } catch (error) {
      console.error('Error depositing:', error);
      let errorMessage = 'Náº¡p tiá»n tháº¥t báº¡i.';
      
      if (error.message) {
        if (error.message.includes('ACCOUNT_FROZEN')) {
          errorMessage = 'TÃ i khoáº£n Äang bá» khÃ³a. KhÃ´ng thá» thá»±c hiá»n giao dá»ch.';
        } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
          errorMessage = 'Sá» dÆ° khÃ´ng Äá»§.';
        } else if (error.message.includes('INVALID_AMOUNT')) {
          errorMessage = 'Sá» tiá»n khÃ´ng há»£p lá».';
        } else {
          errorMessage = error.message;
        }
      }
      
      addFlash('danger', errorMessage);
      return false;
    }
  };

  const handleWithdraw = (amount) => {
    if (!amount || amount <= 0) {
      addFlash('danger', 'Sá» tiá»n khÃ´ng há»£p lá».');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'Sá» dÆ° khÃ´ng Äá»§.');
      return false;
    }
    updateBalance(-amount, 'RÃºt tiá»n');
    addFlash('success', 'RÃºt tiá»n thÃ nh cÃ´ng (demo).');
    return true;
  };

  const handleTransfer = async (toAccountId, amount, note) => {
    if (!toAccountId) {
      addFlash('danger', 'Vui lÃ²ng nháº­p sá» tÃ i khoáº£n ngÆ°á»i nháº­n.');
      return false;
    }
    if (!amount || amount <= 0) {
      addFlash('danger', 'Sá» tiá»n khÃ´ng há»£p lá».');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'Sá» dÆ° khÃ´ng Äá»§.');
      return false;
    }

    try {
      const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await transferApi(token, toAccountId, amount, note);
      if (response && response.data) {
        // Cáº­p nháº­t sá» dÆ° tá»« response
        const newBalance = response.data.newBalance;
        setUser((prev) => ({ ...prev, balance: newBalance }));
        
        // Refresh transactions tá»« backend
        await fetchTransactions(token);
        
        addFlash('success', 'Chuyá»n khoáº£n thÃ nh cÃ´ng.');
        return true;
      }
    } catch (error) {
      addFlash('danger', error.message || 'Chuyá»n khoáº£n tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
      return false;
    }
    return false;
  };

  const handleUpdateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    addFlash('success', 'Cáº­p nháº­t há» sÆ¡ (demo).');
  };

  const handleChangePassword = () => {
    addFlash('success', 'Äá»i máº­t kháº©u (demo).');
  };

  const handleForgotPassword = (email) => {
    addFlash('info', `ÄÃ£ gá»­i email khÃ´i phá»¥c tá»i ${email} (demo).`);
  };

  const handleResetPassword = () => {
    addFlash('success', 'Äáº·t láº¡i máº­t kháº©u (demo).');
  };

  const handleFreezeToggle = () => {
    setUser((prev) => ({ ...prev, isFrozen: !prev.isFrozen }));
    addFlash('info', 'ÄÃ£ chuyá»n tráº¡ng thÃ¡i tÃ i khoáº£n (demo).');
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
          {/* Admin UI đã tách sang app riêng (banking-admin-hub-main) */}
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
          {/* route admin/login chuyển hướng qua app admin mới */}
          <Route path="/admin/login" element={<ExternalRedirect baseUrl={ADMIN_UI_BASE} />} />
          <Route path="/staff/login" element={<StaffLogin onLogin={handleStaffLogin} />} />
          <Route path="/staff" element={<Navigate to="/staff/login" replace />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route
            path="/deposit"
            element={
              isAuthenticated && isCustomer ? (
                <Deposit balance={user.balance} onSubmit={handleDeposit} isFrozen={user.isFrozen} />
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
                <Withdraw balance={user.balance} onSubmit={handleWithdraw} isFrozen={user.isFrozen} />
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
                <Transfer balance={user.balance} onSubmit={handleTransfer} isFrozen={user.isFrozen} />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
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
