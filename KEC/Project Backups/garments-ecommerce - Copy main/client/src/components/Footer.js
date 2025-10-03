import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>G FRESH</h4>
          <p>Premium Quality • Sustainable Fashion • Modern Style</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="contact-list">
            <li>
              <span className="contact-label">Email:</span>
              <a href="mailto:support@gfresh.com">support@gfresh.com</a>
            </li>
            <li>
              <span className="contact-label">Phone:</span>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </li>
            <li>
              <span className="contact-label">Hours:</span> Mon–Fri, 9:00–18:00
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Address</h4>
          <address>
            123 Green Ave,<br />
            Sustainable City, CA 94000
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} G FRESH. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
