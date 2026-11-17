
import { useState } from "react";

function Manufacturer() {
  // Dữ liệu nhập từ form
  const [formData, setFormData] = useState({
    medicineName: "",
    batchId: "",
    manufactureDate: "",
    expiryDate: "",
    distributorAddress: "",
    pharmacyAddress: "",
  });

  // Danh sách lô thuốc mẫu
  const [products, setProducts] = useState([
    {
      productId: "PRD-001",
      medicineName: "Paracetamol 500mg",
      batchId: "BATCH-001",
      manufactureDate: "2026-01-10",
      expiryDate: "2028-01-10",
      distributorAddress:
        "0x1111111111111111111111111111111111111111",
      pharmacyAddress:
        "0x2222222222222222222222222222222222222222",
      status: "AtManufacturer",
    },
  ]);

  const [message, setMessage] = useState("");

  // Cập nhật dữ liệu mỗi khi người dùng nhập
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  // Xử lý tạo lô thuốc mới
  function handleSubmit(event) {
    event.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (Object.values(formData).some((value) => !value.trim())) {
      setMessage("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Kiểm tra ngày hết hạn
    if (formData.expiryDate <= formData.manufactureDate) {
      setMessage("Hạn sử dụng phải sau ngày sản xuất!");
      return;
    }

    // Kiểm tra địa chỉ ví Ethereum
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;

    if (
      !walletRegex.test(formData.distributorAddress) ||
      !walletRegex.test(formData.pharmacyAddress)
    ) {
      setMessage("Địa chỉ ví phải có dạng 0x và 40 ký tự hex!");
      return;
    }

    // Kiểm tra Batch ID trùng
    const isDuplicate = products.some(
      (product) => product.batchId === formData.batchId
    );

    if (isDuplicate) {
      setMessage("Batch ID đã tồn tại!");
      return;
    }

    // Sinh Product ID giả lập
    const productId = `PRD-${String(Date.now())}`;

    // Tạo đối tượng lô thuốc mới
    const newProduct = {
      productId: productId,
      ...formData,
      status: "AtManufacturer",
    };

    // Cập nhật danh sách
    setProducts([...products, newProduct]);

    setMessage(`Tạo lô thuốc thành công! Product ID: ${productId}`);

    // Xóa dữ liệu form
    setFormData({
      medicineName: "",
      batchId: "",
      manufactureDate: "",
      expiryDate: "",
      distributorAddress: "",
      pharmacyAddress: "",
    });
  }

  return (
    <div className="manufacturer-page">
      <div className="manufacturer-heading">
        <h1>🏭 Quản lý sản xuất thuốc</h1>
        <p>
          Tạo và quản lý các lô thuốc trước khi chuyển giao
          đến nhà phân phối.
        </p>
      </div>

      {/* ===== FORM TẠO LÔ THUỐC ===== */}
      <section className="manufacturer-section">
        <h2>Tạo lô thuốc mới</h2>

        <form onSubmit={handleSubmit} className="manufacturer-form">
          <div className="manufacturer-form-grid">
            <div className="manufacturer-form-group">
              <label htmlFor="medicineName">Tên thuốc</label>
              <input
                id="medicineName"
                type="text"
                name="medicineName"
                placeholder="Ví dụ: Paracetamol 500mg"
                value={formData.medicineName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="manufacturer-form-group">
              <label htmlFor="batchId">Batch ID</label>
              <input
                id="batchId"
                type="text"
                name="batchId"
                placeholder="Ví dụ: BATCH-002"
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

          <button className="manufacturer-submit" type="submit">
            + Tạo lô thuốc
          </button>
        </form>

        {message && (
          <p className="manufacturer-message" role="status">
            {message}
          </p>
        )}
      </section>

      {/* ===== BẢNG DANH SÁCH LÔ THUỐC ===== */}
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
              {products.map((product) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Manufacturer;
