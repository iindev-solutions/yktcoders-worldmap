import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorldMap from "./components/WorldMap";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorldMap />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
