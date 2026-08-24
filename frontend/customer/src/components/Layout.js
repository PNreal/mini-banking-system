import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Footer from './Footer';

const FlashMessages = ({ messages, onDismiss }) => {
  // Tự động ẩn message (success: 1s, loại khác: 5s)
  useEffect(() => {
    if (!messages.length || !onDismiss) return;

    const timers = messages.map((msg) => {
      const timeoutMs = msg.type === 'success' ? 1000 : 5000;
      return setTimeout(() => {
        onDismiss(msg.id);
      }, timeoutMs);
    });

    // Cleanup timers khi component unmount hoặc messages thay đổi
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [messages, onDismiss]);

  if (!messages.length) return null;
  return (
    <div className="mt-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`alert alert-${msg.type || 'info'} alert-dismissible fade show`}
          role="alert"
        >
          {msg.text}
          {onDismiss && (
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => onDismiss(msg.id)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const Layout = ({
  children,
  isAuthenticated,
  isAdmin = false,
  onLogout,
  user,
  flashMessages,
  onDismissFlash,
}) => {
  const ADMIN_UI_URL =
    process.env.REACT_APP_ADMIN_UI_URL || 'http://localhost:3001/admin';

  const userRole = user?.role;
  const isStaff = userRole === 'STAFF';
  const isCustomer = userRole === 'CUSTOMER' || (!userRole && isAuthenticated);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="site-header">
        <nav className="navbar navbar-expand-md navbar-dark bg-steel fixed-top">
          <div className="container">
            <Link className="navbar-brand mr-4" to="/">
              BK88
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarToggle"
              aria-controls="navbarToggle"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarToggle">
              <div className="navbar-nav mr-auto">
                <NavLink
                  end
                  className={({ isActive }) =>
                    `nav-item nav-link${isActive ? ' active' : ''}`
                  }
                  to="/"
                >
                  Trang Chủ
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `nav-item nav-link${isActive ? ' active' : ''}`
                  }
                  to="/about"
                >
                  Giới thiệu
                </NavLink>
              </div>
              <div className="navbar-nav">
                {isAuthenticated ? (
                  <>
                    {/* Customer menu - không hiển thị khi là Admin hoặc Staff */}
                    {isCustomer && !isAdmin && !isStaff && (
                      <>
                        <NavLink
                          className={({ isActive }) =>
                            `nav-item nav-link${isActive ? ' active' : ''}`
                          }
                          to="/dashboard"
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          className={({ isActive }) =>
                            `nav-item nav-link${isActive ? ' active' : ''}`
                          }
                          to="/notifications"
                        >
                          Thông báo
                        </NavLink>
                      </>
                    )}
                    {/* Staff menu */}
                    {isStaff && (
                      <>
                        <NavLink
                          className={({ isActive }) =>
                            `nav-item nav-link${isActive ? ' active' : ''}`
                          }
                          to="/staff/dashboard"
                        >
                          Staff Dashboard
                        </NavLink>
                        <NavLink
                          className={({ isActive }) =>
                            `nav-item nav-link${isActive ? ' active' : ''}`
                          }
                          to="/staff/settings"
                        >
                          Cài đặt
                        </NavLink>
                      </>
                    )}
                    {/* Admin menu (admin UI đã tách sang app riêng) */}
                    {isAdmin && (
                      <>
                        <a className="nav-item nav-link" href={ADMIN_UI_URL}>
                          Admin Dashboard
                        </a>
                      </>
                    )}
                    <NavLink
                      className={({ isActive }) =>
                        `nav-item nav-link${isActive ? ' active' : ''}`
                      }
                      to="/settings"
                    >
                      Setting
                    </NavLink>
                    <button
                      className="nav-item nav-link btn btn-link text-light"
                      onClick={onLogout}
                    >
                      Đăng Xuất
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      className={({ isActive }) =>
                        `nav-item nav-link${isActive ? ' active' : ''}`
                      }
                      to="/login"
                    >
                      Đăng Nhập
                    </NavLink>
                    <NavLink
                      className={({ isActive }) =>
                        `nav-item nav-link${isActive ? ' active' : ''}`
                      }
                      to="/register"
                    >
                      Đăng Kí
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main role="main" className="container" style={{ paddingTop: '3rem', flex: 1 }}>
        <FlashMessages messages={flashMessages} onDismiss={onDismissFlash} />
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;

