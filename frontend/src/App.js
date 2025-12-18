import React, { useEffect, useState } from 'react';
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
import AdminCounters from './pages/AdminCounters';
import AdminEmployees from './pages/AdminEmployees';
import StaffDashboard from './pages/StaffDashboard';
import CounterAdminDashboard from './pages/CounterAdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import './App.css';
import { loginApi, loginAdminApi, loginStaffApi, registerApi, getAccountInfoApi, getUserInfoApi, depositApi, transferApi } from './api/client';

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
  const [userRole, setUserRole] = useState(null); // 'ADMIN', 'STAFF', 'CUSTOMER'
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

  // Hàm fetch thông tin user và account từ backend
  const fetchUserData = async (token) => {
    try {
      // Lấy thông tin account (balance, status)
      const accountData = await getAccountInfoApi(token);
      const accountInfo = accountData?.data || {};

      // Thử lấy thông tin user (fullName, email)
      let userInfo = {};
      try {
        const userData = await getUserInfoApi(token);
        if (userData?.data) {
          userInfo = userData.data;
        }
      } catch (e) {
        // Nếu không có endpoint user info, bỏ qua
        console.log('User info endpoint not available');
      }

      // Kết hợp thông tin từ account và user
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
      // Trả về null để dùng fallback
      return null;
    }
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

      const token = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      const profile = data?.user || data?.profile || data?.data || {};
      const role = data?.role || profile.role || 'CUSTOMER';

      if (!token) {
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
      }
      setAuthToken(token);
      setIsAuthenticated(true);
      setUserRole(role);

      // Fetch thông tin user và account từ backend
      const userData = await fetchUserData(token);
      if (userData) {
        setUser({
          ...userData,
          email: userData.email || form.email,
          role: role,
        });

        // Lưu thông tin phiên
        try {
          const storedUser = {
            ...userData,
            email: userData.email || form.email,
            role: role,
          };

          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('userRole', role);
          sessionStorage.setItem('user', JSON.stringify(storedUser));

          localStorage.setItem('authToken', token);
          localStorage.setItem('userRole', role);
          localStorage.setItem('user', JSON.stringify(storedUser));
        } catch (e) {
          // Bỏ qua lỗi storage
        }
      } else {
        // Fallback nếu không fetch được
        setUser((prev) => ({
          ...prev,
          ...profile,
          email: profile.email || form.email,
          role: role,
        }));
      }

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
      // Mapping thông báo lỗi backend sang tiếng Việt, đặc biệt khi email đã tồn tại
      let message = error?.message || 'Có lỗi xảy ra trong quá trình đăng ký.';
      if (message.includes('Email already in use')) {
        message = 'Email này đã được sử dụng. Vui lòng dùng email khác.';
      }
      addFlash('danger', `Đăng ký thất bại: ${message}`);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setAuthToken(null);
    // Xoá thông tin phiên đã ghi nhớ (cả sessionStorage và localStorage)
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    addFlash('info', 'Bạn đã đăng xuất.');
  };

  // Khôi phục phiên đã ghi nhớ (nếu có) khi reload trang
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Ưu tiên kiểm tra sessionStorage trước (phiên hiện tại)
        let storedToken = sessionStorage.getItem('authToken');
        let storedRole = sessionStorage.getItem('userRole');
        let storedUser = sessionStorage.getItem('user');

        // Nếu không có trong sessionStorage, kiểm tra localStorage (ghi nhớ lâu dài)
        if (!storedToken || !storedRole || !storedUser) {
          storedToken = localStorage.getItem('authToken');
          storedRole = localStorage.getItem('userRole');
          storedUser = localStorage.getItem('user');
        }

        if (storedToken && storedRole && storedUser) {
          setAuthToken(storedToken);
          setUserRole(storedRole);
          setIsAuthenticated(true);

          // Fetch thông tin mới nhất từ backend
          const userData = await fetchUserData(storedToken);
          if (userData) {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              ...userData,
              email: userData.email || parsedUser.email,
              role: storedRole,
            });
          } else {
            // Fallback nếu không fetch được
            const parsedUser = JSON.parse(storedUser);
            setUser((prev) => ({
              ...prev,
              ...parsedUser,
            }));
          }
        }
      } catch (e) {
        // Nếu có lỗi parse, xoá dữ liệu lỗi đi
        console.error('Error restoring session:', e);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
      }
    };

    restoreSession();
  }, []);

  // Helper functions for role checking
  const isAdmin = userRole === 'ADMIN';
  const isStaff = userRole === 'STAFF';
  const isCustomer = userRole === 'CUSTOMER';

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
      addFlash('danger', 'Số tiền không hợp lệ.');
      return false;
    }

    const token = authToken || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      addFlash('danger', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return false;
    }

    try {
      const response = await depositApi(token, amount);
      
      if (response?.success && response?.data) {
        const newBalance = response.data.newBalance || user.balance + amount;
        // Cập nhật balance trong user state
        setUser((prev) => ({
          ...prev,
          balance: newBalance,
        }));
        
        // Thêm transaction vào lịch sử
        updateBalance(amount, 'Nạp tiền');
        
        addFlash('success', `Nạp tiền thành công. Số dư mới: ${newBalance.toLocaleString('vi-VN')} VND`);
        return true;
      } else {
        addFlash('danger', 'Nạp tiền thất bại. Vui lòng thử lại.');
        return false;
      }
    } catch (error) {
      console.error('Error depositing:', error);
      let errorMessage = 'Nạp tiền thất bại.';
      
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

  const handleTransfer = async (toAccountId, amount, note) => {
    if (!toAccountId) {
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

    try {
      const token = localStorage.getItem('token');
      const response = await transferApi(token, toAccountId, amount, note);
      if (response && response.data) {
        // Cập nhật số dư từ response
        const newBalance = response.data.newBalance;
        setUser((prev) => ({ ...prev, balance: newBalance }));
        addFlash('success', 'Chuyển khoản thành công.');
        return true;
      }
    } catch (error) {
      addFlash('danger', error.message || 'Chuyển khoản thất bại. Vui lòng thử lại.');
      return false;
    }
    return false;
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
                isAdmin ? <Navigate to="/admin/dashboard" replace /> :
                isStaff ? <Navigate to="/staff/dashboard" replace /> :
                <Navigate to="/dashboard" replace />
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/counter/admin"
            element={
              isAuthenticated && (isStaff || isAdmin) ? (
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
          <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
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
          <Route path="/settings" element={<Settings user={user} onUpdate={handleUpdateProfile} />} />
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
            path="/admin/notifications"
            element={
              isAuthenticated && isAdmin ? (
                <AdminNotifications />
              ) : isAuthenticated ? (
                <Forbidden />
              ) : (
                <Navigate to="/admin/login" replace />
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
            path="/admin/counters"
            element={
              isAuthenticated && isAdmin ? (
                <AdminCounters user={user} />
              ) : (
                <Forbidden />
              )
            }
          />
          <Route
            path="/admin/employees"
            element={
              isAuthenticated && isAdmin ? (
                <AdminEmployees user={user} />
              ) : (
                <Forbidden />
              )
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              isAuthenticated && (isStaff || isAdmin) ? (
                <StaffDashboard user={user} />
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
              isAuthenticated && (isStaff || isAdmin) ? (
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
