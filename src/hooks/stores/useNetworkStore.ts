import { create } from "zustand";

interface EthereumNetwork {
  id: number;
  name: string;
  rpcUrl: string;
  currency: string;
  explorer: string;
}
// Define network configuration
const networks: Record<"mainnet" | "testnet" | "ethereum", EthereumNetwork> = {
  mainnet: {
    id: 56,
    name: "Binance Smart Chain Mainnet",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    currency: "BNB",
    explorer: "https://bscscan.com/",
  },
  testnet: {
    id: 97,
    name: "Binance Smart Chain Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    currency: "BNB Test",
    explorer: "https://testnet.bscscan.com/",
  },
  ethereum: {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    currency: "ETH",
    explorer: "https://etherscan.io/",
  },
};

// Define the Zustand store type
interface NetworkStore {
  selectedNetwork: EthereumNetwork;
  networks: Record<"mainnet" | "testnet" | "ethereum", EthereumNetwork>;
  setNetwork: (networkKey: "mainnet" | "testnet" | "ethereum") => void;
}

// Create the Zustand store
const useNetworkStore = create<NetworkStore>((set) => ({
  selectedNetwork: networks.testnet, // Default to Binance Smart Chain Mainnet
  networks, // Available networks

  setNetwork: (networkKey) => {
    set(() => ({
      selectedNetwork: networks[networkKey],
    }));
  },
}));

export default useNetworkStore;
