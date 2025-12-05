import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route
        path="/dashboard"
        element={<Dashboard currentPage={"dashboard"} />}
      />
    </Routes>
  );
}
