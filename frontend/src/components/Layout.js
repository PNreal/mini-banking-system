import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const FlashMessages = ({ messages, onDismiss }) => {
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
  return (
    <>
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
                    {isAdmin && (
                      <NavLink
                        className={({ isActive }) =>
                          `nav-item nav-link${isActive ? ' active' : ''}`
                        }
                        to="/admin/dashboard"
                      >
                        Admin
                      </NavLink>
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

      <main role="main" className="container" style={{ paddingTop: '5rem' }}>
        <FlashMessages messages={flashMessages} onDismiss={onDismissFlash} />
        {children}
      </main>
    </>
  );
};

export default Layout;

