import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:mode" element={<GamePage />} />
      </Routes>
    </div>
  );
}

export default App;
