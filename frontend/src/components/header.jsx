import { useEffect, useState } from "react";

const GANACHE_CHAIN_ID = "0x539";

const WALLETS = {
  "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1":
    "Manufacturer",

  "0xffcf8fdee72ac11b5c542428b35eef5769c409f0":
    "Distributor",

  "0x22d491bde2303f2f43325b2108d26f1eaba1e32b":
    "Pharmacy"
};

function Header({ account, setAccount }) {
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [chainId, setChainId] = useState("");

  const role =
    WALLETS[account?.toLowerCase()] || "Unknown";

  // ==========================================
  // CHUYỂN MẠNG GANACHE
  // ==========================================

  async function switchToGanache() {
    const provider = window.ethereum;

    const currentChain = await provider.request({
      method: "eth_chainId"
    });

    if (currentChain !== GANACHE_CHAIN_ID) {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: GANACHE_CHAIN_ID
            }
          ]
        });
      } catch (error) {
        if (error.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: GANACHE_CHAIN_ID,
                chainName: "Ganache Local",
                rpcUrls: ["http://127.0.0.1:7545"],
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18
                }
              }
            ]
          });

          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: GANACHE_CHAIN_ID
              }
            ]
          });
        } else {
          throw error;
        }
      }
    }

    const network = await provider.request({
      method: "eth_chainId"
    });

    setChainId(network);

    if (network !== GANACHE_CHAIN_ID) {
      throw new Error(
        "Vui lòng chọn mạng Ganache Local."
      );
    }
  }

  // ==========================================
  // ĐỒNG BỘ TÀI KHOẢN
  // ==========================================

  async function syncWallet() {
    const provider = window.ethereum;

    const accounts = await provider.request({
      method: "eth_accounts"
    });

    const network = await provider.request({
      method: "eth_chainId"
    });

    setChainId(network);

    if (network === GANACHE_CHAIN_ID) {
      setAccount(accounts[0] || "");
    } else {
      setAccount("");
    }
  }

  // ==========================================
  // KẾT NỐI VÍ
  // ==========================================

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    if (connecting) return;

    setConnecting(true);
    setWalletError("");

    try {
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      await switchToGanache();

      await syncWallet();

    } catch (error) {
      setWalletError(
        error.message ||
        "Không thể kết nối MetaMask."
      );
    } finally {
      setConnecting(false);
    }
  }

  // ==========================================
  // ĐỔI TÀI KHOẢN
  // ==========================================

  async function switchWallet() {
    if (!window.ethereum || connecting) return;

    setConnecting(true);
    setWalletError("");

    try {
      // Mở cửa sổ chọn tài khoản MetaMask
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {}
          }
        ]
      });

      // Đảm bảo vẫn sử dụng Ganache
      await switchToGanache();

      // Đọc lại tài khoản mới
      await syncWallet();

    } catch (error) {
      setWalletError(
        error.code === 4001
          ? "Bạn đã hủy chuyển tài khoản."
          : error.message ||
            "Không thể chuyển tài khoản."
      );
    } finally {
      setConnecting(false);
    }
  }

  // ==========================================
  // NGẮT KẾT NỐI
  // ==========================================

  async function disconnectWallet() {
    if (!window.ethereum || connecting) return;

    setConnecting(true);
    setWalletError("");

    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {}
          }
        ]
      });

      setAccount("");

    } catch (error) {
      setWalletError(
        error.message ||
        "Không thể ngắt kết nối ví."
      );
    } finally {
      setConnecting(false);
    }
  }

  // ==========================================
  // TỰ ĐỘNG CẬP NHẬT KHI ĐỔI VÍ HOẶC MẠNG
  // ==========================================

  useEffect(() => {
    const provider = window.ethereum;

    if (!provider) return;

    let active = true;
    let revision = 0;

    async function restoreWallet() {
      const requestId = ++revision;

      try {
        const accounts = await provider.request({
          method: "eth_accounts"
        });

        const network = await provider.request({
          method: "eth_chainId"
        });

        if (!active || requestId !== revision) return;

        setChainId(network);

        if (network === GANACHE_CHAIN_ID) {
          setAccount(accounts[0] || "");
        } else {
          setAccount("");
        }
      } catch (error) {
        if (active && requestId === revision) {
          setAccount("");
          console.error(error);
        }
      }
    }

    restoreWallet();

    provider.on(
      "accountsChanged",
      restoreWallet
    );

    provider.on(
      "chainChanged",
      restoreWallet
    );

    return () => {
      active = false;

      provider.removeListener(
        "accountsChanged",
        restoreWallet
      );

      provider.removeListener(
        "chainChanged",
        restoreWallet
      );
    };
  }, [setAccount]);

  // ==========================================
  // GIAO DIỆN HEADER
  // ==========================================

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">✚</span>

        <h1>
          Pharma<span>Chain</span>
        </h1>
      </div>

      <div
        className="wallet-area"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        {account ? (
          <>
            <span className="wallet-address">
              {role} | {account.slice(0, 6)}...
              {account.slice(-4)}
            </span>

            <button
              className="connect-wallet"
              onClick={switchWallet}
              disabled={connecting}
            >
              {connecting
                ? "Đang xử lý..."
                : "Đổi tài khoản"}
            </button>

            <button
              className="connect-wallet"
              onClick={disconnectWallet}
              disabled={connecting}
              style={{
                backgroundColor: "#dc2626",
                color: "white"
              }}
            >
              Ngắt kết nối
            </button>
          </>
        ) : (
          <button
            className="connect-wallet"
            onClick={connectWallet}
            disabled={connecting}
          >
            {connecting
              ? "Đang kết nối..."
              : chainId &&
                chainId !== GANACHE_CHAIN_ID
              ? "Kết nối Ganache"
              : "Kết nối ví"}
          </button>
        )}

        {chainId === GANACHE_CHAIN_ID && account && (
          <span
            style={{
              color: "#16a34a",
              fontSize: "12px"
            }}
          >
            ● Ganache Local
          </span>
        )}

        {walletError && (
          <span
            role="alert"
            style={{
              color: "#ef4444",
              fontSize: "12px",
              width: "100%"
            }}
          >
            {walletError}
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
