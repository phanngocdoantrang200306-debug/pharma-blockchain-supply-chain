
import { useState } from "react";

import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import Home from "./pages/home";
import Manufacturer from "./pages/manufacturer";
import Distributor from "./pages/distributor";
import Pharmacy from "./pages/pharmacy";
import VerifyProduct from "./pages/verifyProduct";

import "./app.css";

function App() {
  // Lưu tên trang đang được chọn
  const [currentPage, setCurrentPage] = useState("home");

  // Hiển thị trang tương ứng
  function renderPage() {
    switch (currentPage) {
      case "manufacturer":
        return <Manufacturer />;

      case "distributor":
        return <Distributor />;

      case "pharmacy":
        return <Pharmacy />;

      case "verify":
        return <VerifyProduct />;

      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  }

  return (
    <div className="app">
      <Header />

      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
