import "./Home.css";
import  LightRays  from "../../components/lightrays/LightRays.jsx";
import Navbar from '../../components/navbar/Navbar.jsx'
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

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

      <Navbar currentPage={"home"}/>

      <main className="hero-container">
        <div className="hero-content">
          <span className="tagline">Voice-Enabled Task Management</span>
          <h1 className="hero-title">
            Speak Your Tasks, <br /> We'll Organize Them
          </h1>
          <div className="btn-group">
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </button>
            <a
              href="https://github.com/DeepakAvadhani/Voice-Enabled-Task-Tracker.git"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="btn-secondary"
                style={{ cursor: "pointer", opacity: 1 }}
              >
                Learn More
              </button>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
