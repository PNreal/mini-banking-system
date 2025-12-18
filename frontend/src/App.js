import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
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
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import './App.css';
import { loginApi, loginAdminApi, loginStaffApi, registerApi } from './api/client';

const initialUser = {
  username: 'BK88 User',
  email: 'user@bk88.vn',
  userId: '000123456789',
  balance: 25000000,
  imageFile: `${process.env.PUBLIC_URL}/assets/default.jpg`,
  isFrozen: false,
};

function App() {
  const [user, setUser] = useState(initialUser);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);
  const [transactions, setTransactions] = useState(() => [
    {
      id: 1,
      type: 'Nạp tiền',
      amount: 1500000,
      date: '2025-01-05T09:00:00Z',
    },
    {
      id: 2,
      type: 'Rút tiền',
      amount: -500000,
      date: '2025-01-06T11:15:00Z',
    },
    {
      id: 3,
      type: 'Chuyển khoản',
      amount: -700000,
      date: '2025-01-07T14:30:00Z',
    },
  ]);

  const addFlash = (type, text) => {
    setFlashMessages((prev) => [...prev, { id: Date.now() + Math.random(), type, text }]);
  };

  const handleLogin = async (form) => {
    return doLogin(form, loginApi);
  };

  const handleAdminLogin = async (form) => {
    return doLogin(form, loginAdminApi);
  };

  const handleStaffLogin = async (form) => {
    return doLogin(form, loginStaffApi);
  };

  const doLogin = async (form, loginFn) => {
    try {
      const data = await loginFn({
        email: form.email,
        password: form.password,
      });

      const token = data?.token || data?.accessToken || data?.jwt;
      const profile = data?.user || data?.profile || {};
      const role = data?.role || profile.role;

      if (!token) {
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
      }

      setAuthToken(token);
      setIsAuthenticated(true);
      setIsAdmin(role === 'ADMIN');
      setUser((prev) => ({
        ...prev,
        ...profile,
        email: profile.email || form.email,
        role: role,
      }));

      addFlash('success', 'Đăng nhập thành công.');
      return true;
    } catch (error) {
      addFlash('danger', `Đăng nhập thất bại: ${error.message}`);
      return false;
    }
  };

  const handleRegister = async (form) => {
    try {
      await registerApi({
        fullName: form.username,
        email: form.email,
        password: form.password,
      });

      addFlash('success', 'Đăng ký thành công. Vui lòng đăng nhập.');
      return true;
    } catch (error) {
      addFlash('danger', `Đăng ký thất bại: ${error.message}`);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthToken(null);
    addFlash('info', 'Bạn đã đăng xuất.');
  };

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

  const handleDeposit = (amount) => {
    if (!amount || amount <= 0) {
      addFlash('danger', 'Số tiền không hợp lệ.');
      return false;
    }
    updateBalance(amount, 'Nạp tiền');
    addFlash('success', 'Nạp tiền thành công (demo).');
    return true;
  };

  const handleWithdraw = (amount) => {
    if (!amount || amount <= 0) {
      addFlash('danger', 'Số tiền không hợp lệ.');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'Số dư không đủ.');
      return false;
    }
    updateBalance(-amount, 'Rút tiền');
    addFlash('success', 'Rút tiền thành công (demo).');
    return true;
  };

  const handleTransfer = (receiver, amount) => {
    if (!receiver) {
      addFlash('danger', 'Vui lòng nhập số tài khoản người nhận.');
      return false;
    }
    if (!amount || amount <= 0) {
      addFlash('danger', 'Số tiền không hợp lệ.');
      return false;
    }
    if (amount > user.balance) {
      addFlash('warning', 'Số dư không đủ.');
      return false;
    }
    updateBalance(-amount, `Chuyển khoản tới ${receiver}`);
    addFlash('success', 'Chuyển khoản thành công (demo).');
    return true;
  };

  const handleUpdateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    addFlash('success', 'Cập nhật hồ sơ (demo).');
  };

  const handleChangePassword = () => {
    addFlash('success', 'Đổi mật khẩu (demo).');
  };

  const handleForgotPassword = (email) => {
    addFlash('info', `Đã gửi email khôi phục tới ${email} (demo).`);
  };

  const handleResetPassword = () => {
    addFlash('success', 'Đặt lại mật khẩu (demo).');
  };

  const handleFreezeToggle = () => {
    setUser((prev) => ({ ...prev, isFrozen: !prev.isFrozen }));
    addFlash('info', 'Đã chuyển trạng thái tài khoản (demo).');
  };

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
                <Navigate to="/dashboard" replace />
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard
                  user={user}
                  transactions={transactions}
                  onFreezeToggle={handleFreezeToggle}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/transactions"
            element={
              isAuthenticated ? (
                <Transactions transactions={transactions} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/staff/login" element={<StaffLogin onLogin={handleStaffLogin} />} />
          <Route path="/staff" element={<Navigate to="/staff/login" replace />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route
            path="/deposit"
            element={
              <Deposit balance={user.balance} onSubmit={handleDeposit} isFrozen={user.isFrozen} />
            }
          />
          <Route
            path="/withdraw"
            element={
              <Withdraw balance={user.balance} onSubmit={handleWithdraw} isFrozen={user.isFrozen} />
            }
          />
          <Route
            path="/transfer"
            element={
              <Transfer balance={user.balance} onSubmit={handleTransfer} isFrozen={user.isFrozen} />
            }
          />
          <Route path="/settings" element={<Settings user={user} onUpdate={handleUpdateProfile} />} />
          <Route path="/change-password" element={<ChangePassword onSubmit={handleChangePassword} />} />
          <Route path="/forgot-password" element={<ForgotPassword onSubmit={handleForgotPassword} />} />
          <Route path="/reset-password" element={<ResetPassword onSubmit={handleResetPassword} />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/notifications"
            element={
              isAuthenticated ? (
                <Notifications user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated && isAdmin ? (
                <AdminDashboard user={user} />
              ) : (
                <Forbidden />
              )
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              isAuthenticated ? (
                <StaffDashboard user={user} />
              ) : (
                <Navigate to="/" replace />
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
