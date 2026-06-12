export type Chain = "evm" | "solana";

export type PlayerStat = {
  label: string;
  value: number;
};

export type PlayerProfile = {
  nickname: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
};

export type WalletAddress = {
  id: string;
  label: string;
  chain: Chain;
  address: string;
  createdAt: string;
};

export type TokenBalance = {
  walletId: string;
  walletLabel: string;
  chain: Chain;
  symbol: string;
  amount: number;
  usdValue: number;
};

export const playerStats: PlayerStat[] = [
  { label: "Focus", value: 0 },
  { label: "Body", value: 0 },
  { label: "Will", value: 0 },
  { label: "Creative", value: 0 },
  { label: "Social", value: 0 },
  { label: "Discipline", value: 0 }
];

export const defaultProfile: PlayerProfile = {
  nickname: "New Character",
  level: 1,
  xp: 0,
  xpToNextLevel: 100
};

export const inventorySlots = [
  "Documents",
  "Ideas",
  "Resources",
  "Contacts",
  "Artifacts",
  "Purchases",
  "Projects",
  "Empty"
];

export const dailyQuests = [
  "Ten minutes of movement",
  "One deep work block",
  "Write a short day log"
];

const demoTokens: Record<Chain, Array<{ symbol: string; price: number }>> = {
  evm: [
    { symbol: "ETH", price: 3520 },
    { symbol: "USDC", price: 1 },
    { symbol: "ARB", price: 1.35 },
    { symbol: "OP", price: 2.1 },
    { symbol: "LINK", price: 18.4 },
    { symbol: "AAVE", price: 104 }
  ],
  solana: [
    { symbol: "SOL", price: 165 },
    { symbol: "USDC", price: 1 },
    { symbol: "JUP", price: 1.18 },
    { symbol: "RAY", price: 2.4 },
    { symbol: "PYTH", price: 0.48 },
    { symbol: "BONK", price: 0.000028 }
  ]
};

export function isValidWalletAddress(chain: Chain, address: string): boolean {
  const trimmed = address.trim();

  if (chain === "evm") {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  }

  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
}

export function shortAddress(address: string): string {
  if (address.length <= 14) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);
}

export function formatAmount(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}

export function createWalletId(): string {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getDemoBalances(wallets: WalletAddress[]): TokenBalance[] {
  return wallets.flatMap((wallet) =>
    demoTokens[wallet.chain].map((token, index) => {
      const seed = hashString(`${wallet.chain}:${wallet.address}`);
      const shifted = seed >>> (index % 12);
      const base = (shifted % 870) / 100;
      const amount = token.price > 100
        ? base / 8
        : token.price < 0.001
          ? base * 100000
          : base * 3;

      return {
        walletId: wallet.id,
        walletLabel: wallet.label,
        chain: wallet.chain,
        symbol: token.symbol,
        amount,
        usdValue: amount * token.price
      };
    })
  );
}

export function getPortfolioTotals(balances: TokenBalance[]) {
  return balances.reduce(
    (totals, balance) => {
      totals.total += balance.usdValue;
      totals[balance.chain] += balance.usdValue;
      return totals;
    },
    { total: 0, evm: 0, solana: 0 }
  );
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
