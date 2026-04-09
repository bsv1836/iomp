import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <span className="footer-text">Developed by</span>
        <div className="footer-links">
          <a
            href="https://www.linkedin.com/in/shanmukhavasb/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link-item"
          >
            B Shanmukha Vas
          </a>
          <span className="footer-divider">|</span>
          <a
            href="https://www.linkedin.com/in/hasini-reddy-588861300/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link-item"
          >
            S Hasini Reddy
          </a>
          <span className="footer-divider">|</span>
          <a
            href="https://www.linkedin.com/in/bhanu-prasad-podila-936271344/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link-item"
          >
            P Bhanu Prasad
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
