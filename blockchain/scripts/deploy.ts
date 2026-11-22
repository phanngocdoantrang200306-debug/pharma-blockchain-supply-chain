
import { network } from "hardhat";
import { writeFileSync } from "node:fs";

async function main() {
  const { viem, networkName } = await network.create();

  console.log("Network:", networkName);

  const wallets = await viem.getWalletClients();

  if (wallets.length < 3) {
    throw new Error(
      "Can it nhat 3 tai khoan Ganache de demo"
    );
  }

  const deployer = wallets[0];
  const distributor = wallets[1];
  const pharmacy = wallets[2];

  console.log("Manufacturer:", deployer.account.address);
  console.log("Distributor:", distributor.account.address);
  console.log("Pharmacy:", pharmacy.account.address);

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

  console.log("Deploy thanh cong!");
  console.log("Contract Address:", contract.address);

  const manufacturer = await contract.read.manufacturer();
  const productCount = await contract.read.productCount();

  console.log("Manufacturer on-chain:", manufacturer);
  console.log("Product Count:", productCount.toString());

  if (
    manufacturer.toLowerCase() !==
    deployer.account.address.toLowerCase()
  ) {
    throw new Error("Manufacturer khong khop!");
  }

  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();

  const config = {
    contractAddress: contract.address,
    chainId: chainId,
    manufacturer: deployer.account.address,
    distributor: distributor.account.address,
    pharmacy: pharmacy.account.address,
  };

  // Ganache Test khong ghi de cau hinh demo chinh
  const fileName =
    networkName === "ganache"
      ? "contract-config.json"
      : "contract-config.test.json";

  const configPath = new URL(
    "../../frontend/src/" + fileName,
    import.meta.url
  );

  writeFileSync(
    configPath,
    JSON.stringify(config, null, 2),
    "utf8"
  );

  console.log("Da cap nhat " + fileName);
  console.log("Kiem tra contract thanh cong!");
}

main().catch((error) => {
  console.error("Deploy that bai:", error);
  process.exitCode = 1;
});
