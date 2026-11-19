
import { useState, useEffect, useCallback } from "react";
import { getContract } from "./contract";

import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import Home from "./pages/home";
import Manufacturer from "./pages/manufacturer";
import Distributor from "./pages/distributor";
import Pharmacy from "./pages/pharmacy";
import VerifyProduct from "./pages/verifyProduct";

import "./app.css";

// Trạng thái lô thuốc
const statuses = [
  "AtManufacturer",
  "AtDistributor",
  "AtPharmacy"
];

// So sánh địa chỉ ví
const same = (a, b) =>
  a?.toLowerCase() === b?.toLowerCase();

// Chuyển timestamp thành ngày
const dateOnly = (seconds) => {
  const d = new Date(Number(seconds) * 1000);

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const errorText = (e) =>
  e?.cause?.message || e?.message || String(e);

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [account, setAccount] = useState("");

  // Không sử dụng dữ liệu mẫu
  const [products, setProducts] = useState([]);

  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // KIỂM TRA KẾT NỐI BLOCKCHAIN
  // ==========================================

  async function checkedContract() {
    if (!window.ethereum) {
      throw new Error("Chưa cài MetaMask.");
    }

    const chainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (Number(chainId) !== 1337) {
      throw new Error("Vui lòng chọn Ganache Local.");
    }

    return getContract();
  }

  // ==========================================
  // ĐỌC DỮ LIỆU BLOCKCHAIN
  // ==========================================

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const contract = await checkedContract();

      const ids = await contract.methods
        .getAllProductIds()
        .call();

      const rows = await Promise.all(
        ids.map(async (id) => {
          const p = await contract.methods
            .getProduct(id)
            .call();

          const history = await contract.methods
            .getProductHistory(id)
            .call();

          return {
            productId: String(p.productId),

            medicineName: p.medicineName,

            batchId: p.batchId,

            manufactureDate: dateOnly(
              p.manufactureDate
            ),

            expiryDate: dateOnly(p.expiryDate),

            manufacturerAddress: p.manufacturer,
            distributorAddress: p.distributor,
            pharmacyAddress: p.pharmacy,

            status:
              statuses[Number(p.status)] ??
              `Status ${p.status}`,

            history: history.map((h) => ({
              role: same(h.actor, p.manufacturer)
                ? "Manufacturer"
                : same(h.actor, p.distributor)
                ? "Distributor"
                : same(h.actor, p.pharmacy)
                ? "Pharmacy"
                : "Unknown",

              action: h.action,

              wallet: h.actor,

              timestamp: new Date(
                Number(h.timestamp) * 1000
              ).toISOString()
            }))
          };
        })
      );

      setProducts(rows);

      return true;

    } catch (e) {
      setProducts([]);
      setLoadError(errorText(e));

      return false;

    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU
  // ==========================================

// ==========================================
// TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU
// ==========================================

useEffect(() => {
  loadProducts();
}, [loadProducts, currentPage, account]);

useEffect(() => {
  const provider = window.ethereum;

  if (!provider) return;

  const handleChainChanged = () => {
    loadProducts();
  };

  provider.on(
    "chainChanged",
    handleChainChanged
  );

  return () => {
    provider.removeListener(
      "chainChanged",
      handleChainChanged
    );
  };
}, [loadProducts]);

  // ==========================================
  // KIỂM TRA VÍ KÝ TRANSACTION
  // ==========================================

  async function signingAccount() {
    const accounts = await window.ethereum.request({
      method: "eth_accounts"
    });

    if (!account || !same(account, accounts[0])) {
      throw new Error(
        "Vui lòng kết nối đúng ví MetaMask."
      );
    }

    return accounts[0];
  }

  // ==========================================
  // MANUFACTURER - TẠO LÔ THUỐC
  // ==========================================

  async function addProduct(formData) {
    try {
      const contract = await checkedContract();

      const from = await signingAccount();
      // Kiểm tra quyền Nhà sản xuất
      const manufacturerAddress = await contract.methods
        .manufacturer()
        .call();

      if (!same(from, manufacturerAddress)) {
        throw new Error(
          "Access Denied: Chỉ nhà sản xuất mới được tạo lô thuốc!"
        );
      }
      const manufactureDate = Math.floor(
        new Date(
          formData.manufactureDate + "T00:00:00"
        ).getTime() / 1000
      );

      const expiryDate = Math.floor(
        new Date(
          formData.expiryDate + "T00:00:00"
        ).getTime() / 1000
      );

      const receipt = await contract.methods
        .createProduct(
          formData.medicineName.trim(),
          formData.batchId.trim(),
          manufactureDate,
          expiryDate,
          formData.distributorAddress.trim(),
          formData.pharmacyAddress.trim()
        )
        .send({
          from,
          gas: "5000000"
        });

      console.log("Transaction:", receipt);

      // Lấy Product ID từ event
      const id =
        receipt.events?.ProductCreated
          ?.returnValues?.productId;

      // Tải lại dữ liệu Blockchain
      const refreshed = await loadProducts();

      return {
        success: true,

        productId:
          id == null ? undefined : String(id),

        message:
          "Tạo lô thuốc thành công!" +
          (id == null ? "" : ` Product ID: ${id}`) +
          (refreshed
            ? ""
            : " Hãy tải lại danh sách.")
      };

    } catch (e) {
      return {
        success: false,
        message: errorText(e)
      };
    }
  }

  // ==========================================
  // XÁC NHẬN CHUYỂN GIAO
  // ==========================================

  async function confirm(productId, role) {
    try {
      const contract = await checkedContract();

      const from = await signingAccount();

      const p = await contract.methods
        .getProduct(productId)
        .call();

      if (!p.exists) {
        throw new Error("Không tìm thấy lô thuốc.");
      }

      const distributor = role === "Distributor";

      // Kiểm tra quyền xác nhận
      if (
        !same(
          from,
          distributor ? p.distributor : p.pharmacy
        )
      ) {
        throw new Error(
          "Ví không được chỉ định nhận lô thuốc."
        );
      }

      // Kiểm tra trạng thái
      if (
        Number(p.status) !== (distributor ? 0 : 1)
      ) {
        throw new Error(
          "Trạng thái lô thuốc không phù hợp."
        );
      }

      // Chọn hàm Smart Contract
      const method = distributor
        ? contract.methods.confirmDistributor
        : contract.methods.confirmPharmacy;

      await method(productId).send({
        from,
        gas: "5000000"
      });

      const refreshed = await loadProducts();

      return {
        success: true,
        message:
          `Đã xác nhận lô thuốc ${productId}!` +
          (refreshed
            ? ""
            : " Hãy tải lại danh sách.")
      };

    } catch (e) {
      return {
        success: false,
        message: errorText(e)
      };
    }
  }

  // Distributor
  const confirmDistributor = (id) =>
    confirm(id, "Distributor");

  // Pharmacy
  const confirmPharmacy = (id) =>
    confirm(id, "Pharmacy");

  // ==========================================
  // RENDER PAGE
  // ==========================================

  function renderPage() {
    switch (currentPage) {
      case "manufacturer":
        return (
          <Manufacturer
            products={products}
            addProduct={addProduct}
            account={account}
          />
        );

      case "distributor":
        return (
          <Distributor
            products={products}
            confirmDistributor={confirmDistributor}
            account={account}
          />
        );

      case "pharmacy":
        return (
          <Pharmacy
            products={products}
            confirmPharmacy={confirmPharmacy}
            account={account}
          />
        );

      case "verify":
        return (
          <VerifyProduct products={products} />
        );

      default:
        return (
          <Home setCurrentPage={setCurrentPage} />
        );
    }
  }

  return (
    <div className="app">

      <Header
        account={account}
        setAccount={setAccount}
      />

      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">

        {loading && (
          <p role="status">
            Đang tải dữ liệu Blockchain...
          </p>
        )}

        {loadError && (
          <p role="alert">{loadError}</p>
        )}


        {renderPage()}

      </main>

      <Footer />

    </div>
  );
}

export default App;
