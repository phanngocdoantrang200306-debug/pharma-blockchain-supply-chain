
# Pharma Blockchain Supply Chain

Blockchain-based pharmaceutical supply chain tracking
and verification system.

## 1. Project Overview

This system provides pharmaceutical product traceability
through blockchain technology.

The system includes three main roles:

- Manufacturer: Create pharmaceutical products.
- Distributor: Confirm product receipt.
- Pharmacy: Confirm final product receipt.

Users can verify product information and transaction
history directly from the blockchain.

## 2. Technologies

- Solidity
- Hardhat 3
- Ganache
- Viem
- Web3.js
- React
- Vite
- MetaMask

## 3. Prerequisites

Install the following software:

- Node.js 22.12+ (compatible LTS version)
- npm
- Git
- Visual Studio Code
- MetaMask browser extension

## 4. Installation

Clone the repository:

```shell
git clone -b blockchain-integration https://github.com/phanngocdoantrang200306-debug/pharma-blockchain-supply-chain.git

cd pharma-blockchain-supply-chain
```

Install frontend dependencies:

```shell
npm ci
```

Install blockchain dependencies:

```shell
npm ci --prefix blockchain --allow-git=all
```

Install Ganache:

```shell
npm install -g ganache
```

## 5. Start Ganache

Open Terminal 1 in the project root:

```shell
ganache --host 127.0.0.1 --port 7545 --chain.chainId 1337 --chain.hardfork shanghai --wallet.deterministic --wallet.defaultBalance 1000 --database.dbPath ./ganache-data
```

Keep this terminal running.

## 6. Deploy Smart Contract

Open Terminal 2 in the project root.

Compile the smart contract:

```shell
npm run compile --prefix blockchain
```

Deploy the smart contract:

```shell
npm run deploy --prefix blockchain
```

The deployment script automatically:

- Connects to Ganache.
- Selects the Manufacturer account.
- Deploys PharmaSupplychain.
- Verifies the Manufacturer address.
- Generates frontend/src/contract-config.json.

No manual deployment using Remix is required.

Only deploy once when initializing a new blockchain.
Deploying again creates a new contract with empty data.

## 7. Configure MetaMask

Add a custom network:

| Configuration | Value |
|---|---|
| Network Name | Ganache Local |
| RPC URL | http://127.0.0.1:7545 |
| Chain ID | 1337 |
| Currency Symbol | ETH |

Import the first three test accounts using the private
keys displayed in the local Ganache terminal.

| Account | Role |
|---|---|
| Account 0 | Manufacturer |
| Account 1 | Distributor |
| Account 2 | Pharmacy |

These accounts are for local testing only.
Never use them to store real funds.

## 8. Run Frontend

Open Terminal 3 in the project root:

```shell
npm run dev
```

Open the localhost URL displayed in the terminal.

Connect MetaMask and select the correct account.

## 9. System Workflow

Manufacturer
    -> Create Product
    -> AtManufacturer

Distributor
    -> Confirm Receipt
    -> AtDistributor

Pharmacy
    -> Confirm Receipt
    -> AtPharmacy

Customer
    -> Verify Product Information and History

## 10. Functional Testing

| ID | Test Case | Expected Result |
|---|---|---|
| FT01 | Connect MetaMask | Wallet connected |
| FT02 | Create product | AtManufacturer |
| FT03 | Distributor confirmation | AtDistributor |
| FT04 | Pharmacy confirmation | AtPharmacy |
| FT05 | Verify product | Correct information and history |
| FT06 | Refresh website | Product data persists |

### Example Product

- Medicine Name: Paracetamol 500mg
- Batch ID: BATCH-001
- Manufacture Date: 19/11/2026
- Expiry Date: 19/06/2027
- Distributor: Ganache Account 1 address
- Pharmacy: Ganache Account 2 address

Use a unique Batch ID for each product.

## 11. Security Testing

| ID | Test Case | Expected Result |
|---|---|---|
| ST01 | Unauthorized product creation | Rejected |
| ST02 | Unauthorized distributor | Rejected |
| ST03 | Invalid state transition | Rejected |
| ST04 | Duplicate confirmation | Rejected |
| ST05 | Duplicate Batch ID | Rejected |
| ST06 | Invalid expiry date | Rejected |
| ST07 | Empty product information | Rejected |
| ST08 | Zero wallet address | Rejected |
| ST09 | Duplicate role addresses | Rejected |
| ST10 | Non-existent product | Rejected |

Direct smart contract security tests can be performed
using Remix connected to the local Ganache network.

Verify product count and product history before and
after rejected transactions.

## 12. Troubleshooting

### Failed to fetch

Make sure Ganache is running on port 7545.

### Contract not found

Check the MetaMask network and the contract address
in frontend/src/contract-config.json.

### EALLOWGIT

Install blockchain dependencies using:

```shell
npm ci --prefix blockchain --allow-git=all
```

### EPERM

Close processes using blockchain/node_modules,
remove the affected directory, and reinstall.

### Blocked esbuild installation script

Run inside the blockchain directory:

```shell
npm install-scripts ls
npm install-scripts approve esbuild
npm rebuild esbuild
```

Only approve trusted installation scripts.

### Empty product list

A newly deployed smart contract contains no products.

Create a product using the Manufacturer account.

### Dependency vulnerabilities

Review the dependencies using npm audit.

Do not use npm audit fix --force without checking
dependency compatibility.

## 13. Automated Hardhat Tests

Run the existing Hardhat tests:

```shell
cd blockchain
npx hardhat test
```

The repository may include default Hardhat example tests.
These tests are separate from the pharmaceutical
security test cases listed above.

## 14. Project Structure

```text
pharma-blockchain-supply-chain/
├── blockchain/
│   ├── contracts/
│   │   └── pharmaSupplychain.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── hardhat.config.ts
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── contract.js
│       ├── contract-config.json
│       └── web3.js
├── .gitignore
├── package.json
└── README.md
```

## 15. Important Notes

- Each team member runs an independent local blockchain.
- Blockchain data is stored in ganache-data.
- Never share real private keys or seed phrases.
- Do not commit node_modules or ganache-data.
- Deploy the contract before running the frontend.
- Keep Ganache running while using the application.
- This project is intended for academic demonstration.
- Security testing is not a comprehensive security audit.
