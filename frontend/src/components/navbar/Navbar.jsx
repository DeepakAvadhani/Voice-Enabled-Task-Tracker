import './Navbar.css';

function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">TaskTracker</span>
      </div>
      <div className="navbar-right">
        <a 
          href="#home" 
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
        >
          Home
        </a>
        <a 
          href="#dashboard" 
          className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}

export default Navbar;