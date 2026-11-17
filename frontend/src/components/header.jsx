
function Header() {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">✚</span>

        <h1>
          Pharma<span>Chain</span>
        </h1>
      </div>

      <button
        className="connect-wallet"
        onClick={() => alert("Chức năng MetaMask sẽ được thêm sau!")}
      >
        Kết nối ví
      </button>
    </header>
  );
}

export default Header;
