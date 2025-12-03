import "./App.css";
import LightRays from "./components/LightRays.jsx";

function App() {
  return (
    <>
      <div className="background-rays">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      <nav className="navbar">
        <div className="navbar-left">
          <svg
            className="navbar-logo"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M2 12 L22 12 M12 2 L12 22 M16 8 L8 16 M8 8 L16 16" />
          </svg>
          <span className="navbar-title">React Bits</span>
        </div>

        <div className="navbar-right">
          <a href="#home" className="nav-link">Home</a>
          <a href="#docs" className="nav-link">Docs</a>
        </div>
      </nav>

      <main className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            May these lights guide <br /> you on your path
          </h1>
          <div className="btn-group">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
