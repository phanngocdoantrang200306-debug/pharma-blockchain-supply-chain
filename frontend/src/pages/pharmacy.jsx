
import { useState } from "react";

function Pharmacy({ products, confirmPharmacy }) {
  const [walletAddress, setWalletAddress] = useState(
    "0x4444444444444444444444444444444444444444"
  );

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  const isValidWallet = walletRegex.test(walletAddress);

  // Lọc lô thuốc theo ví Pharmacy
  const myProducts = isValidWallet
    ? products.filter(
        (product) =>
          product.pharmacyAddress.toLowerCase() ===
          walletAddress.toLowerCase()
      )
    : [];

  const pendingCount = myProducts.filter(
    (product) => product.status === "AtDistributor"
  ).length;

  const receivedCount = myProducts.filter(
    (product) => product.status === "AtPharmacy"
  ).length;

  function handleConfirm(productId) {
    if (!isValidWallet) {
      setMessage("Địa chỉ ví không hợp lệ!");
      setMessageType("error");
      return;
    }

    const result = confirmPharmacy(
      productId,
      walletAddress
    );

    setMessage(result.message);
    setMessageType(result.success ? "success" : "error");
  }

  function getStatusClass(status) {
    if (status === "AtPharmacy") {
      return "pharmacy-status received";
    }

    if (status === "AtDistributor") {
      return "pharmacy-status pending";
    }

    return "pharmacy-status waiting";
  }

  return (
    <div className="pharmacy-page">
      <div className="pharmacy-heading">
        <h1>🏥 Quản lý tiếp nhận thuốc</h1>
        <p>
          Theo dõi và xác nhận các lô thuốc
          được chuyển giao từ nhà phân phối.
        </p>
      </div>

      <section className="pharmacy-section">
        <h2>Thông tin nhà thuốc</h2>

        <div className="pharmacy-wallet">
          <label htmlFor="pharmacyWallet">
            Địa chỉ ví Pharmacy
          </label>

          <input
            id="pharmacyWallet"
            type="text"
            value={walletAddress}
            onChange={(event) => {
              setWalletAddress(event.target.value);
              setMessage("");
            }}
            placeholder="Nhập địa chỉ ví 0x..."
          />

          <p>
            Ví mô phỏng, chưa kết nối MetaMask.
          </p>

          {!isValidWallet && (
            <p className="pharmacy-error">
              Địa chỉ ví không hợp lệ!
            </p>
          )}
        </div>
      </section>

      <div className="pharmacy-stats">
        <div className="pharmacy-stat-card">
          <h3>Lô thuốc chờ nhận</h3>
          <p>{pendingCount}</p>
        </div>

        <div className="pharmacy-stat-card">
          <h3>Lô thuốc đã nhận</h3>
          <p>{receivedCount}</p>
        </div>
      </div>

      <section className="pharmacy-section">
        <h2>Danh sách lô thuốc</h2>

        <div className="pharmacy-table-wrapper">
          <table className="pharmacy-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên thuốc</th>
                <th>Batch ID</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {myProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="pharmacy-empty"
                  >
                    Không có lô thuốc nào được chỉ định.
                  </td>
                </tr>
              ) : (
                myProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.medicineName}</td>
                    <td>{product.batchId}</td>

                    <td>
                      <span
                        className={getStatusClass(
                          product.status
                        )}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td>
                      {product.status === "AtDistributor" ? (
                        <button
                          className="pharmacy-confirm-btn"
                          onClick={() =>
                            handleConfirm(product.productId)
                          }
                        >
                          Xác nhận nhận hàng
                        </button>
                      ) : product.status === "AtPharmacy" ? (
                        <span className="pharmacy-completed">
                          Đã tiếp nhận
                        </span>
                      ) : (
                        <span className="pharmacy-waiting-text">
                          Chờ nhà phân phối
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

      {message && (
        <div
          className={`pharmacy-message ${messageType}`}
          role="status"
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Pharmacy;
