
import { useState } from "react";

const emptyForm = {
  medicineName: "",
  batchId: "",
  manufactureDate: "",
  expiryDate: "",
  distributorAddress: "",
  pharmacyAddress: "",
};

function Manufacturer({ products, addProduct }) {
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Kiểm tra dữ liệu trống
    if (
      Object.values(formData).some(
        (value) => !value.trim()
      )
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin!");
      setMessageType("error");
      return;
    }

    // Kiểm tra ngày sản xuất và hạn sử dụng
    if (formData.expiryDate <= formData.manufactureDate) {
      setMessage("Hạn sử dụng phải sau ngày sản xuất!");
      setMessageType("error");
      return;
    }

    // Kiểm tra định dạng ví
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;

    if (
      !walletRegex.test(formData.distributorAddress) ||
      !walletRegex.test(formData.pharmacyAddress)
    ) {
      setMessage("Địa chỉ ví Ethereum không hợp lệ!");
      setMessageType("error");
      return;
    }

    if (
      formData.distributorAddress.toLowerCase() ===
      formData.pharmacyAddress.toLowerCase()
    ) {
      setMessage(
        "Ví Distributor và Pharmacy phải khác nhau!"
      );
      setMessageType("error");
      return;
    }

    // Gọi hàm được truyền từ App.jsx
    const result = addProduct({
      ...formData,
      medicineName: formData.medicineName.trim(),
      batchId: formData.batchId.trim(),
      distributorAddress:
        formData.distributorAddress.trim(),
      pharmacyAddress: formData.pharmacyAddress.trim(),
    });

    setMessage(result.message);
    setMessageType(result.success ? "success" : "error");

    if (result.success) {
      setFormData(emptyForm);
    }
  }

  return (
    <div className="manufacturer-page">
      <div className="manufacturer-heading">
        <h1>🏭 Quản lý sản xuất thuốc</h1>
        <p>
          Tạo và quản lý các lô thuốc trước khi chuyển
          giao đến nhà phân phối.
        </p>
      </div>

      <section className="manufacturer-section">
        <h2>Tạo lô thuốc mới</h2>

        <form
          onSubmit={handleSubmit}
          className="manufacturer-form"
        >
          <div className="manufacturer-form-grid">
            <div className="manufacturer-form-group">
              <label htmlFor="medicineName">
                Tên thuốc
              </label>

              <input
                id="medicineName"
                type="text"
                name="medicineName"
                placeholder="Paracetamol 500mg"
                value={formData.medicineName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="batchId">
                Batch ID
              </label>

              <input
                id="batchId"
                type="text"
                name="batchId"
                placeholder="BATCH-004"
                value={formData.batchId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="manufactureDate">
                Ngày sản xuất
              </label>

              <input
                id="manufactureDate"
                type="date"
                name="manufactureDate"
                value={formData.manufactureDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="expiryDate">
                Hạn sử dụng
              </label>

              <input
                id="expiryDate"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="distributorAddress">
                Ví nhà phân phối
              </label>

              <input
                id="distributorAddress"
                type="text"
                name="distributorAddress"
                placeholder="0x..."
                value={formData.distributorAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="pharmacyAddress">
                Ví nhà thuốc
              </label>

              <input
                id="pharmacyAddress"
                type="text"
                name="pharmacyAddress"
                placeholder="0x..."
                value={formData.pharmacyAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            className="manufacturer-submit"
            type="submit"
          >
            + Tạo lô thuốc
          </button>
        </form>

        {message && (
          <p
            className={`manufacturer-message ${messageType}`}
            role="status"
          >
            {message}
          </p>
        )}
      </section>

      <section className="manufacturer-section">
        <h2>Danh sách lô thuốc</h2>

        <div className="manufacturer-table-wrapper">
          <table className="manufacturer-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên thuốc</th>
                <th>Batch ID</th>
                <th>Ngày sản xuất</th>
                <th>Hạn sử dụng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    Chưa có lô thuốc nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.medicineName}</td>
                    <td>{product.batchId}</td>
                    <td>{product.manufactureDate}</td>
                    <td>{product.expiryDate}</td>

                    <td>
                      <span className="manufacturer-status">
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Manufacturer;
