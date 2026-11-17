
function Home({ setCurrentPage }) {
  const features = [
    {
      id: "manufacturer",
      icon: "🏭",
      title: "Nhà sản xuất",
      english: "Manufacturer",
      description:
        "Tạo và quản lý thông tin lô thuốc trên hệ thống Blockchain.",
    },
    {
      id: "distributor",
      icon: "🚚",
      title: "Nhà phân phối",
      english: "Distributor",
      description:
        "Kiểm tra và xác nhận tiếp nhận lô thuốc từ nhà sản xuất.",
    },
    {
      id: "pharmacy",
      icon: "🏥",
      title: "Nhà thuốc",
      english: "Pharmacy",
      description:
        "Tiếp nhận và xác nhận các lô thuốc từ nhà phân phối.",
    },
    {
      id: "verify",
      icon: "🔍",
      title: "Tra cứu thuốc",
      english: "Verify Product",
      description:
        "Kiểm tra thông tin và lịch sử lưu chuyển của lô thuốc.",
    },
  ];

  return (
    <div className="home">

      {/* ===== HERO SECTION ===== */}
      <section className="home-hero">
        <span className="home-label">
          BLOCKCHAIN PHARMACEUTICAL TRACKING
        </span>

        <h1>
          Minh bạch nguồn gốc dược phẩm
          <br />
          <span>Bằng công nghệ Blockchain</span>
        </h1>

        <p>
          PharmaChain là hệ thống hỗ trợ quản lý và truy xuất
          nguồn gốc dược phẩm bằng Blockchain và Smart Contract.
          Hệ thống ghi nhận lịch sử chuyển giao lô thuốc từ
          nhà sản xuất đến nhà thuốc, giúp phát hiện các
          bất thường trong quá trình lưu chuyển.
        </p>

        <div className="home-buttons">
          <button
            className="home-primary-btn"
            onClick={() => setCurrentPage("verify")}
          >
            Tra cứu thuốc
          </button>

          <button
            className="home-secondary-btn"
            onClick={() => setCurrentPage("manufacturer")}
          >
            Khám phá hệ thống
          </button>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="home-features">
        <div className="home-section-title">
          <span className="home-label">SYSTEM FEATURES</span>
          <h2>Chức năng hệ thống</h2>
          <p>
            Các chức năng được xây dựng theo từng vai trò
            trong chuỗi cung ứng dược phẩm.
          </p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature) => (
            <div className="home-feature-card" key={feature.id}>
              <div className="home-feature-icon">
                {feature.icon}
              </div>

              <span className="home-feature-english">
                {feature.english}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <button
                className="home-feature-link"
                onClick={() => setCurrentPage(feature.id)}
              >
                Khám phá →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WORKFLOW SECTION ===== */}
      <section className="home-workflow">
        <div className="home-section-title">
          <span className="home-label">SUPPLY CHAIN</span>
          <h2>Quy trình chuỗi cung ứng</h2>
          <p>
            Theo dõi các bước chuyển giao quyền quản lý
            của một lô thuốc.
          </p>
        </div>

        <div className="home-workflow-steps">
          <div className="home-workflow-step">
            <span>🏭</span>
            <h3>Manufacturer</h3>
            <p>Khởi tạo lô thuốc</p>
          </div>

          <div className="home-workflow-arrow">→</div>

          <div className="home-workflow-step">
            <span>🚚</span>
            <h3>Distributor</h3>
            <p>Xác nhận nhận hàng</p>
          </div>

          <div className="home-workflow-arrow">→</div>

          <div className="home-workflow-step">
            <span>🏥</span>
            <h3>Pharmacy</h3>
            <p>Xác nhận nhận hàng</p>
          </div>
        </div>

        <p className="home-workflow-note">
          Lịch sử chuyển giao được ghi nhận trên Blockchain
          và có thể truy xuất bằng Product ID.
        </p>
      </section>

    </div>
  );
}

export default Home;
