import { useState } from "react";

function Distributor() {
  // Ví Distributor dùng để mô phỏng
  const [walletAddress, setWalletAddress] = useState(
    "0x3333333333333333333333333333333333333333"
  );

  // Danh sách lô thuốc mẫu
  const [products, setProducts] = useState([
    {
      productId: "PRD-001",
      medicineName: "Paracetamol 500mg",
      batchId: "BATCH-001",
      manufacturer: "Pharma Company A",
      distributorAddress:
        "0x3333333333333333333333333333333333333333",
      pharmacyAddress:
        "0x4444444444444444444444444444444444444444",
      status: "AtManufacturer",
    },
    {
      productId: "PRD-002",
      medicineName: "Amoxicillin 500mg",
      batchId: "BATCH-002",
      manufacturer: "Pharma Company B",
      distributorAddress:
        "0x3333333333333333333333333333333333333333",
      pharmacyAddress:
        "0x4444444444444444444444444444444444444444",
      status: "AtDistributor",
    },
    {
      productId: "PRD-003",
      medicineName: "Vitamin C 1000mg",
      batchId: "BATCH-003",
      manufacturer: "Pharma Company C",
      distributorAddress:
        "0x5555555555555555555555555555555555555555",
      pharmacyAddress:
        "0x6666666666666666666666666666666666666666",
      status: "AtManufacturer",
    },
  ]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Kiểm tra địa chỉ ví Ethereum
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  const isValidWallet = walletRegex.test(walletAddress);

  // Xác định lô thuốc thuộc ví hiện tại
  const myProducts = isValidWallet
    ? products.filter(
        (product) =>
          product.distributorAddress.toLowerCase() ===
          walletAddress.toLowerCase()
      )
    : [];

  // Thống kê số lô thuốc theo trạng thái
  const pendingCount = myProducts.filter(
    (product) => product.status === "AtManufacturer"
  ).length;

  const receivedCount = myProducts.filter(
    (product) => product.status === "AtDistributor"
  ).length;

  // Hàm xác nhận nhận hàng
  function handleConfirm(productId) {
    const product = products.find(
      (item) => item.productId === productId
    );

    if (!product) {
      setMessage("Không tìm thấy lô thuốc!");
      setMessageType("error");
      return;
    }

    if (
      !isValidWallet ||
      product.distributorAddress.toLowerCase() !==
        walletAddress.toLowerCase()
    ) {
      setMessage("Ví này không có quyền xác nhận lô thuốc!");
      setMessageType("error");
      return;
    }

    if (product.status !== "AtManufacturer") {
      setMessage("Lô thuốc không ở trạng thái chờ nhận!");
      setMessageType("error");
      return;
    }

    // Cập nhật trạng thái bằng useState
    const updatedProducts = products.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          status: "AtDistributor",
        };
      }

      return item;
    });

    setProducts(updatedProducts);

    setMessage(
      `Đã xác nhận nhận hàng thành công: ${productId}`
    );
    setMessageType("success");
  }

  return (
    <div className="distributor-page">

      {/* ===== TIÊU ĐỀ ===== */}
      <div className="distributor-heading">
        <h1>🚚 Quản lý phân phối thuốc</h1>
        <p>
          Theo dõi và xác nhận các lô thuốc được
          chuyển giao từ nhà sản xuất.
        </p>
      </div>

      {/* ===== THÔNG TIN VÍ ===== */}
      <section className="distributor-section">
        <h2>Thông tin nhà phân phối</h2>

        <div className="distributor-wallet">
          <label htmlFor="distributorWallet">
            Địa chỉ ví Distributor
          </label>

          <input
            id="distributorWallet"
            type="text"
            value={walletAddress}
            onChange={(event) => {
              setWalletAddress(event.target.value);
              setMessage("");
            }}
            placeholder="Nhập địa chỉ ví 0x..."
          />

          <p>
            Đây là địa chỉ ví mô phỏng.
            Sau này sẽ lấy từ MetaMask.
          </p>

          {!isValidWallet && (
            <p className="distributor-error">
              Địa chỉ ví không hợp lệ!
            </p>
          )}
        </div>
      </section>

      {/* ===== THỐNG KÊ ===== */}
      <div className="distributor-stats">
        <div className="distributor-stat-card">
          <h3>Lô thuốc chờ nhận</h3>
          <p>{pendingCount}</p>
        </div>

        <div className="distributor-stat-card">
          <h3>Lô thuốc đã nhận</h3>
          <p>{receivedCount}</p>
        </div>
      </div>

      {/* ===== DANH SÁCH LÔ THUỐC ===== */}
      <section className="distributor-section">
        <h2>Danh sách lô thuốc</h2>

        <div className="distributor-table-wrapper">
          <table className="distributor-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên thuốc</th>
                <th>Batch ID</th>
                <th>Nhà sản xuất</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {myProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="distributor-empty">
                    Không có lô thuốc nào được chỉ định
                    cho địa chỉ ví này.
                  </td>
                </tr>
              ) : (
                myProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.medicineName}</td>
                    <td>{product.batchId}</td>
                    <td>{product.manufacturer}</td>

                    <td>
                      <span
                        className={
                          product.status === "AtDistributor"
                            ? "distributor-status received"
                            : "distributor-status pending"
                        }
                      >
                        {product.status}
                      </span>
                    </td>

                    <td>
                      {product.status === "AtManufacturer" ? (
                        <button
                          className="distributor-confirm-btn"
                          onClick={() =>
                            handleConfirm(product.productId)
                          }
                        >
                          Xác nhận nhận hàng
                        </button>
                      ) : (
                        <span className="distributor-completed">
                          Đã xác nhận
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== THÔNG BÁO ===== */}
      {message && (
        <div
          className={`distributor-message ${messageType}`}
          role="status"
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Distributor;
