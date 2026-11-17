
import { useState } from "react";

import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import Home from "./pages/home";
import Manufacturer from "./pages/manufacturer";
import Distributor from "./pages/distributor";
import Pharmacy from "./pages/pharmacy";
import VerifyProduct from "./pages/verifyProduct";

import "./app.css";

// Địa chỉ ví mẫu
const MANUFACTURER_WALLET =
  "0x1111111111111111111111111111111111111111";

const DISTRIBUTOR_WALLET =
  "0x3333333333333333333333333333333333333333";

const PHARMACY_WALLET =
  "0x4444444444444444444444444444444444444444";

// Dữ liệu ban đầu dùng chung
const initialProducts = [
  {
    productId: "PRD-001",
    medicineName: "Paracetamol 500mg",
    batchId: "BATCH-001",
    manufactureDate: "2026-01-10",
    expiryDate: "2028-01-10",
    manufacturerAddress: MANUFACTURER_WALLET,
    distributorAddress: DISTRIBUTOR_WALLET,
    pharmacyAddress: PHARMACY_WALLET,
    status: "AtManufacturer",
    history: [
      {
        role: "Manufacturer",
        action: "Nhà sản xuất khởi tạo lô thuốc",
        wallet: MANUFACTURER_WALLET,
        timestamp: "2026-01-10T08:30:00",
      },
    ],
  },
  {
    productId: "PRD-002",
    medicineName: "Amoxicillin 500mg",
    batchId: "BATCH-002",
    manufactureDate: "2026-01-10",
    expiryDate: "2028-01-10",
    manufacturerAddress: MANUFACTURER_WALLET,
    distributorAddress: DISTRIBUTOR_WALLET,
    pharmacyAddress: PHARMACY_WALLET,
    status: "AtDistributor",
    history: [
      {
        role: "Manufacturer",
        action: "Nhà sản xuất khởi tạo lô thuốc",
        wallet: MANUFACTURER_WALLET,
        timestamp: "2026-01-10T08:30:00",
      },
      {
        role: "Distributor",
        action: "Nhà phân phối xác nhận nhận hàng",
        wallet: DISTRIBUTOR_WALLET,
        timestamp: "2026-01-12T14:20:00",
      },
    ],
  },
  {
    productId: "PRD-003",
    medicineName: "Vitamin C 1000mg",
    batchId: "BATCH-003",
    manufactureDate: "2026-02-01",
    expiryDate: "2028-02-01",
    manufacturerAddress: MANUFACTURER_WALLET,
    distributorAddress: DISTRIBUTOR_WALLET,
    pharmacyAddress: PHARMACY_WALLET,
    status: "AtPharmacy",
    history: [
      {
        role: "Manufacturer",
        action: "Nhà sản xuất khởi tạo lô thuốc",
        wallet: MANUFACTURER_WALLET,
        timestamp: "2026-02-01T09:00:00",
      },
      {
        role: "Distributor",
        action: "Nhà phân phối xác nhận nhận hàng",
        wallet: DISTRIBUTOR_WALLET,
        timestamp: "2026-02-03T11:15:00",
      },
      {
        role: "Pharmacy",
        action: "Nhà thuốc xác nhận nhận hàng",
        wallet: PHARMACY_WALLET,
        timestamp: "2026-02-05T15:45:00",
      },
    ],
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // State chung của toàn ứng dụng
  const [products, setProducts] = useState(initialProducts);

  // Tạo lô thuốc mới
  function addProduct(formData) {
    const duplicate = products.some(
      (product) =>
        product.batchId.toLowerCase() ===
        formData.batchId.trim().toLowerCase()
    );

    if (duplicate) {
      return {
        success: false,
        message: "Batch ID đã tồn tại!",
      };
    }

    // Product ID chỉ dùng trong bản demo
    const productId = `PRD-${Date.now()}`;

    const newProduct = {
      ...formData,
      productId,
      status: "AtManufacturer",
      manufacturerAddress: MANUFACTURER_WALLET,
      history: [
        {
          role: "Manufacturer",
          action: "Nhà sản xuất khởi tạo lô thuốc",
          wallet: MANUFACTURER_WALLET,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setProducts((previous) => [...previous, newProduct]);

    return {
      success: true,
      productId,
      message: `Tạo lô thuốc thành công: ${productId}`,
    };
  }

  // Distributor xác nhận nhận hàng
  function confirmDistributor(productId, walletAddress) {
    const product = products.find(
      (item) => item.productId === productId
    );

    if (!product) {
      return {
        success: false,
        message: "Không tìm thấy lô thuốc!",
      };
    }

    if (
      product.distributorAddress.toLowerCase() !==
      walletAddress.trim().toLowerCase()
    ) {
      return {
        success: false,
        message: "Ví không được chỉ định nhận lô thuốc!",
      };
    }

    if (product.status !== "AtManufacturer") {
      return {
        success: false,
        message: "Lô thuốc không ở trạng thái AtManufacturer!",
      };
    }

    setProducts((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        return {
          ...item,
          status: "AtDistributor",
          history: [
            ...item.history,
            {
              role: "Distributor",
              action: "Nhà phân phối xác nhận nhận hàng",
              wallet: walletAddress.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );

    return {
      success: true,
      message: `Đã xác nhận lô thuốc ${productId}!`,
    };
  }

  // Pharmacy xác nhận nhận hàng
  function confirmPharmacy(productId, walletAddress) {
    const product = products.find(
      (item) => item.productId === productId
    );

    if (!product) {
      return {
        success: false,
        message: "Không tìm thấy lô thuốc!",
      };
    }

    if (
      product.pharmacyAddress.toLowerCase() !==
      walletAddress.trim().toLowerCase()
    ) {
      return {
        success: false,
        message: "Ví không được chỉ định nhận lô thuốc!",
      };
    }

    if (product.status !== "AtDistributor") {
      return {
        success: false,
        message: "Lô thuốc chưa được Distributor bàn giao!",
      };
    }

    setProducts((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        return {
          ...item,
          status: "AtPharmacy",
          history: [
            ...item.history,
            {
              role: "Pharmacy",
              action: "Nhà thuốc xác nhận nhận hàng",
              wallet: walletAddress.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );

    return {
      success: true,
      message: `Nhà thuốc đã tiếp nhận lô ${productId}!`,
    };
  }

  function renderPage() {
    switch (currentPage) {
      case "manufacturer":
        return (
          <Manufacturer
            products={products}
            addProduct={addProduct}
          />
        );

      case "distributor":
        return (
          <Distributor
            products={products}
            confirmDistributor={confirmDistributor}
          />
        );

      case "pharmacy":
        return (
          <Pharmacy
            products={products}
            confirmPharmacy={confirmPharmacy}
          />
        );

      case "verify":
        return <VerifyProduct products={products} />;

      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  }

  return (
    <div className="app">
      <Header />

      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
