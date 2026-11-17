
function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav className="navbar">
      <button
        className={currentPage === "home" ? "active" : ""}
        onClick={() => setCurrentPage("home")}
      >
        Trang chủ
      </button>

      <button
        className={currentPage === "manufacturer" ? "active" : ""}
        onClick={() => setCurrentPage("manufacturer")}
      >
        Nhà sản xuất
      </button>

      <button
        className={currentPage === "distributor" ? "active" : ""}
        onClick={() => setCurrentPage("distributor")}
      >
        Nhà phân phối
      </button>

      <button
        className={currentPage === "pharmacy" ? "active" : ""}
        onClick={() => setCurrentPage("pharmacy")}
      >
        Nhà thuốc
      </button>

      <button
        className={currentPage === "verify" ? "active" : ""}
        onClick={() => setCurrentPage("verify")}
      >
        Tra cứu thuốc
      </button>
    </nav>
  );
}

export default Navbar;
