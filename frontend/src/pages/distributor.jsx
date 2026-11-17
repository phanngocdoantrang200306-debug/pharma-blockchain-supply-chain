
import { useState } from "react";

function Distributor({ products, confirmDistributor }) {
  const [walletAddress, setWalletAddress] = useState(
    "0x3333333333333333333333333333333333333333"
  );

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  const isValidWallet = walletRegex.test(walletAddress);

  // Lọc lô thuốc theo ví Distributor
  const myProducts = isValidWallet
    ? products.filter(
        (product) =>
          product.distributorAddress.toLowerCase() ===
          walletAddress.toLowerCase()
      )
    : [];

  const pendingCount = myProducts.filter(
    (product) => product.status === "AtManufacturer"
  ).length;

  const receivedCount = myProducts.filter(
    (product) =>
      product.status === "AtDistributor" ||
      product.status === "AtPharmacy"
  ).length;

  function handleConfirm(productId) {
    if (!isValidWallet) {
      setMessage("Địa chỉ ví không hợp lệ!");
      setMessageType("error");
      return;
    }

    // Gọi hàm xử lý tại App.jsx
    const result = confirmDistributor(
      productId,
      walletAddress
    );

    setMessage(result.message);
    setMessageType(result.success ? "success" : "error");
  }

  function getStatusClass(status) {
    if (status === "AtManufacturer") {
      return "distributor-status pending";
    }

    return "distributor-status received";
  }

  return (
    <div className="distributor-page">
      <div className="distributor-heading">
        <h1>🚚 Quản lý phân phối thuốc</h1>
        <p>
          Theo dõi và xác nhận các lô thuốc
          được chuyển giao từ nhà sản xuất.
        </p>
      </div>

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
            Ví mô phỏng, chưa kết nối MetaMask.
          </p>

          {!isValidWallet && (
            <p className="distributor-error">
              Địa chỉ ví không hợp lệ!
            </p>
          )}
        </div>
      </section>

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

      <section className="distributor-section">
        <h2>Danh sách lô thuốc</h2>

        <div className="distributor-table-wrapper">
          <table className="distributor-table">
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
                    className="distributor-empty"
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
