
import { useState } from "react";

function VerifyProduct({ products }) {

  const [productId, setProductId] = useState("");

  const [searchedId, setSearchedId] = useState("");

  const [message, setMessage] = useState("");

  const selectedProduct = products.find(
    (item) => item.productId === searchedId
  );

  // Tra cứu thuốc
  function handleSearch(event) {
    event.preventDefault();

    const searchId = productId.trim().toUpperCase();

    if (!searchId) {
      setSearchedId("");
      setMessage("Vui lòng nhập Product ID!");
      return;
    }

    const product = products.find(
      (item) => item.productId === searchId
    );

    if (!product) {
      setSearchedId("");

      setMessage(
        "Không tìm thấy lô thuốc với Product ID này!"
      );

      return;
    }

    setSearchedId(searchId);
    setMessage("");
  }

  // Định dạng ngày tháng
  function formatDate(dateString) {

    if (!dateString) {
      return "Không có dữ liệu";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] =
        dateString.split("-");

      return `${day}/${month}/${year}`;
    }

    return new Date(dateString).toLocaleString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // Trạng thái tiếng Việt
  function getStatusText(status) {
    switch (status) {

      case "AtManufacturer":
        return "Đang ở nhà sản xuất";

      case "AtDistributor":
        return "Đang ở nhà phân phối";

      case "AtPharmacy":
        return "Đã đến nhà thuốc";

      default:
        return "Không xác định";
    }
  }

  return (
    <div className="verify-page">

      <div className="verify-heading">

        <h1>🔍 Tra cứu nguồn gốc thuốc</h1>

        <p>
          Nhập Product ID để kiểm tra thông tin,
          trạng thái và lịch sử chuyển giao lô thuốc.
        </p>

      </div>

      {/* FORM TRA CỨU */}

      <section className="verify-section">

        <h2>Tra cứu Product ID</h2>

        <form
          onSubmit={handleSearch}
          className="verify-form"
        >

          <label htmlFor="verifyProductId">
            Mã định danh lô thuốc
          </label>

          <div className="verify-search-row">

            <input
              id="verifyProductId"
              type="text"
              placeholder="Ví dụ: 1"
              value={productId}
              onChange={(event) =>
                setProductId(event.target.value)
              }
            />

            <button
              type="submit"
              className="verify-search-btn"
            >
              Tra cứu
            </button>

          </div>

        </form>

        <p className="verify-hint">
          Nhập Product ID đã được tạo trên Blockchain.
        </p>

        {message && (
          <p className="verify-message" role="status">
            {message}
          </p>
        )}

      </section>

      {/* KẾT QUẢ TRA CỨU */}

      {selectedProduct && (
        <>

          <section className="verify-section">

            <div className="verify-result-header">

              <div>
                <span className="verify-label">
                  PRODUCT INFORMATION
                </span>

                <h2>
                  {selectedProduct.medicineName}
                </h2>
              </div>

              <span className="verify-status">
                {getStatusText(selectedProduct.status)}
              </span>

            </div>

            <div className="verify-info-grid">

              <div>
                <span>Product ID</span>
                <strong>
                  {selectedProduct.productId}
                </strong>
              </div>

              <div>
                <span>Batch ID</span>
                <strong>
                  {selectedProduct.batchId}
                </strong>
              </div>

              <div>
                <span>Ngày sản xuất</span>
                <strong>
                  {formatDate(
                    selectedProduct.manufactureDate
                  )}
                </strong>
              </div>

              <div>
                <span>Hạn sử dụng</span>
                <strong>
                  {formatDate(
                    selectedProduct.expiryDate
                  )}
                </strong>
              </div>

              <div>
                <span>Trạng thái hiện tại</span>
                <strong>
                  {selectedProduct.status}
                </strong>
              </div>

            </div>

          </section>

          {/* THÔNG TIN CÁC VÍ */}

          <section className="verify-section">

            <h2>Các bên trong chuỗi cung ứng</h2>

            <div className="verify-wallet-list">

              <div>
                <strong>🏭 Manufacturer</strong>
                <p>
                  {selectedProduct.manufacturerAddress}
                </p>
              </div>

              <div>
                <strong>🚚 Distributor</strong>
                <p>
                  {selectedProduct.distributorAddress}
                </p>
              </div>

              <div>
                <strong>🏥 Pharmacy</strong>
                <p>
                  {selectedProduct.pharmacyAddress}
                </p>
              </div>

            </div>

          </section>

          {/* LỊCH SỬ BLOCKCHAIN */}

          <section className="verify-section">

            <h2>Lịch sử chuyển giao lô thuốc</h2>

            <div className="verify-timeline">

              {selectedProduct.history.map(
                (historyEvent, index) => (

                  <div
                    className="verify-timeline-item"
                    key={index}
                  >

                    <div className="verify-timeline-dot">
                    </div>

                    <div className="verify-timeline-content">

                      <span className="verify-timeline-role">
                        {historyEvent.role}
                      </span>

                      <h3>{historyEvent.action}</h3>

                      <p>
                        Thời gian:{" "}
                        {formatDate(
                          historyEvent.timestamp
                        )}
                      </p>

                      <p className="verify-timeline-wallet">
                        Ví xác nhận:{" "}
                        {historyEvent.wallet}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

            {selectedProduct.status !== "AtPharmacy" && (
              <p className="verify-pending-note">
                Lô thuốc chưa hoàn thành toàn bộ
                quy trình chuyển giao đến nhà thuốc.
              </p>
            )}

          </section>

        </>
      )}

      <p className="verify-demo-note">
        Thông tin và lịch sử được đọc từ Smart Contract
        trên Ganache.
      </p>

    </div>
  );
}

export default VerifyProduct;
