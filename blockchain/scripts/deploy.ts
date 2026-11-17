
import { network } from "hardhat";

async function main() {
  // 1. Kết nối mạng được chọn
  const { viem, networkName } = await network.create();

  console.log("Network:", networkName);

  // 2. Lấy danh sách ví từ Ganache
  const wallets = await viem.getWalletClients();

  if (wallets.length < 3) {
    throw new Error(
      "Can it nhat 3 tai khoan Ganache de demo"
    );
  }

  // Ví đầu tiên sẽ là Manufacturer
  const deployer = wallets[0];

  console.log(
    "Manufacturer wallet:",
    deployer.account.address
  );

  console.log(
    "Distributor wallet:",
    wallets[1].account.address
  );

  console.log(
    "Pharmacy wallet:",
    wallets[2].account.address
  );

  // 3. Deploy Smart Contract
  console.log("Dang deploy PharmaSupplychain...");

  const contract = await viem.deployContract(
    "PharmaSupplychain",
    [],
    {
      client: {
        wallet: deployer,
      },
    }
  );

  // 4. Hiển thị địa chỉ sau khi deploy
  console.log("Deploy thanh cong!");
  console.log("Contract Address:", contract.address);

  // 5. Đọc dữ liệu từ contract để kiểm tra
  const manufacturer = await contract.read.manufacturer();
  const productCount = await contract.read.productCount();

  console.log("Manufacturer on-chain:", manufacturer);
  console.log("Product Count:", productCount.toString());

  // 6. Kiểm tra đúng Manufacturer
  if (
    manufacturer.toLowerCase() !==
    deployer.account.address.toLowerCase()
  ) {
    throw new Error("Manufacturer khong khop!");
  }

  console.log("Kiem tra contract thanh cong!");
}

main().catch((error) => {
  console.error("Deploy that bai:", error);
  process.exitCode = 1;
});
