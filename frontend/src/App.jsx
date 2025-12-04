import { useState } from "react";
import "./App.css";
import LightRays from './components/lightrays/LightRays.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  if (currentPage === "dashboard") {
    return <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />;
  }

  return (
    <>
      <div className="background-rays">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffffff"
          raysSpeed={1.5}
          lightSpread={5}
          rayLength={2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="hero-container">
        <div className="hero-content">
          <span className="tagline">Voice-Enabled Task Management</span>
          <h1 className="hero-title">
            Speak Your Tasks, <br /> We'll Organize Them
          </h1>
          <div className="btn-group">
            <button 
              className="btn-primary"
              onClick={() => setCurrentPage("dashboard")}
            >
              Get Started
            </button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;