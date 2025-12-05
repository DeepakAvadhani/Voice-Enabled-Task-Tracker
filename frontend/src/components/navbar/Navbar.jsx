import { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

function Navbar({ currentPage, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">TaskTracker</span>
      </div>

      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
      </button>

      <div className={`navbar-right ${isMenuOpen ? "mobile-open" : ""}`}>
        <a
          href="#home"
          className={`nav-link ${currentPage === "home" ? "active" : ""}`}
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </a>
        <a
          href="#dashboard"
          className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
