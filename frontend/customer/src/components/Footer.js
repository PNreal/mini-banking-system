import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer mt-4">
      <div className="container">
        <div className="row py-2 py-md-3">
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <h5 className="footer-brand mb-2">BK88</h5>
            <p className="text-muted small mb-2">
              Ngân hàng số hiện đại, mang đến trải nghiệm giao dịch an toàn và tiện lợi.
            </p>
            <div className="social-links mt-2">
              <a href="#" className="social-link me-2" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link me-2" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link me-2" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="col-6 col-md-2 mb-3 mb-md-0">
            <h6 className="footer-heading mb-2">Dịch vụ</h6>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/deposit">Nạp tiền</Link>
              </li>
              <li>
                <Link to="/withdraw">Rút tiền</Link>
              </li>
              <li>
                <Link to="/transfer">Chuyển khoản</Link>
              </li>
              <li>
                <Link to="/transactions">Lịch sử giao dịch</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-md-2 mb-3 mb-md-0">
            <h6 className="footer-heading mb-2">Hỗ trợ</h6>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li>
                <a href="#faq">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#contact">Liên hệ</a>
              </li>
              <li>
                <a href="#help">Hướng dẫn</a>
              </li>
            </ul>
          </div>
          
          <div className="col-12 col-md-4">
            <h6 className="footer-heading mb-2">Liên hệ</h6>
            <ul className="list-unstyled footer-contact">
              <li className="mb-1">
                <i className="fas fa-phone me-2"></i>
                <a href="tel:1900123456" className="text-muted small">1900 123 456</a>
              </li>
              <li className="mb-1">
                <i className="fas fa-envelope me-2"></i>
                <a href="mailto:support@bk88.vn" className="text-muted small">support@bk88.vn</a>
              </li>
              <li>
                <i className="fas fa-clock me-2"></i>
                <span className="text-muted small">Hỗ trợ 24/7</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="footer-divider" />
        
        <div className="row">
          <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
            <p className="text-muted small mb-0">
              &copy; {currentYear} BK88. Tất cả quyền được bảo lưu.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#privacy" className="text-muted small">Chính sách bảo mật</a>
              </li>
              <li className="list-inline-item">
                <span className="text-muted">|</span>
              </li>
              <li className="list-inline-item">
                <a href="#terms" className="text-muted small">Điều khoản</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

