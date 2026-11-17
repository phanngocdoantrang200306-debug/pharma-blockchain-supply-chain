
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

// Tạo blockchain giả lập để chạy test
const { viem } = await hre.network.create();

// Các ngày dùng để kiểm thử (Unix timestamp)
const manufactureDate = 1761955200n;
const expiryDate = 1825027200n;

describe("PharmaSupplychain", function () {

  // TEST 1: Manufacturer tạo lô thuốc
  it("Manufacturer tao lo thuoc thanh cong", async function () {
    const wallets = await viem.getWalletClients();

    const distributor = wallets[1];
    const pharmacy = wallets[2];

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    await contract.write.createProduct([
      "Paracetamol 500mg",
      "BATCH-001",
      manufactureDate,
      expiryDate,
      distributor.account.address,
      pharmacy.account.address,
    ]);

    const product = await contract.read.getProduct([1n]);

    assert.equal(product.productId, 1n);
    assert.equal(product.medicineName, "Paracetamol 500mg");
    assert.equal(product.batchId, "BATCH-001");
    assert.equal(product.status, 0);
  });

  // TEST 2: Ví khác không được tạo thuốc
  it("Tu choi vi khong phai Manufacturer", async function () {
    const wallets = await viem.getWalletClients();

    const distributor = wallets[1];
    const pharmacy = wallets[2];
    const stranger = wallets[3];

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    await viem.assertions.revertWith(
      contract.write.createProduct(
        [
          "Ibuprofen 400mg",
          "BATCH-002",
          manufactureDate,
          expiryDate,
          distributor.account.address,
          pharmacy.account.address,
        ],
        {
          account: stranger.account,
        }
      ),
      "Only manufacturer is allowed"
    );
  });

  // TEST 3: Không cho tạo Batch ID trùng
  it("Tu choi Batch ID trung", async function () {
    const wallets = await viem.getWalletClients();

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    const distributor = wallets[1];
    const pharmacy = wallets[2];

    const data = [
      "Paracetamol 500mg",
      "BATCH-001",
      manufactureDate,
      expiryDate,
      distributor.account.address,
      pharmacy.account.address,
    ] as const;

    await contract.write.createProduct(data);

    await viem.assertions.revertWith(
      contract.write.createProduct(data),
      "Batch ID already exists"
    );
  });

  // TEST 4: Distributor xác nhận nhận thuốc
  it("Distributor xac nhan nhan hang", async function () {
    const wallets = await viem.getWalletClients();

    const distributor = wallets[1];
    const pharmacy = wallets[2];

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    await contract.write.createProduct([
      "Amoxicillin 500mg",
      "BATCH-003",
      manufactureDate,
      expiryDate,
      distributor.account.address,
      pharmacy.account.address,
    ]);

    await contract.write.confirmDistributor(
      [1n],
      {
        account: distributor.account,
      }
    );

    const product = await contract.read.getProduct([1n]);

    assert.equal(product.status, 1);
  });

  // TEST 5: Pharmacy không được nhận trước Distributor
  it("Tu choi Pharmacy khi chua qua Distributor", async function () {
    const wallets = await viem.getWalletClients();

    const distributor = wallets[1];
    const pharmacy = wallets[2];

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    await contract.write.createProduct([
      "Vitamin C 1000mg",
      "BATCH-004",
      manufactureDate,
      expiryDate,
      distributor.account.address,
      pharmacy.account.address,
    ]);

    await viem.assertions.revertWith(
      contract.write.confirmPharmacy(
        [1n],
        {
          account: pharmacy.account,
        }
      ),
      "Invalid product status"
    );
  });

  // TEST 6: Kiểm thử toàn bộ chuỗi cung ứng
  it("Hoan thanh Manufacturer Distributor Pharmacy", async function () {
    const wallets = await viem.getWalletClients();

    const distributor = wallets[1];
    const pharmacy = wallets[2];

    const contract = await viem.deployContract(
      "PharmaSupplychain"
    );

    // Nhà sản xuất tạo thuốc
    await contract.write.createProduct([
      "Ibuprofen 400mg",
      "BATCH-005",
      manufactureDate,
      expiryDate,
      distributor.account.address,
      pharmacy.account.address,
    ]);

    // Nhà phân phối xác nhận
    await contract.write.confirmDistributor(
      [1n],
      {
        account: distributor.account,
      }
    );

    // Nhà thuốc xác nhận
    await contract.write.confirmPharmacy(
      [1n],
      {
        account: pharmacy.account,
      }
    );

    // Kiểm tra trạng thái cuối
    const product = await contract.read.getProduct([1n]);

    assert.equal(product.status, 2);

    // Kiểm tra lịch sử
    const history = await contract.read.getProductHistory([1n]);

    assert.equal(history.length, 3);

    assert.equal(
      history[0].action,
      "Manufacturer created product"
    );

    assert.equal(
      history[1].action,
      "Distributor confirmed receipt"
    );

    assert.equal(
      history[2].action,
      "Pharmacy confirmed receipt"
    );
  });
});
