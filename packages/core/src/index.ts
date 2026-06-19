export type Chain = "evm" | "solana";

export type PlayerStat = {
  label: string;
  value: number;
};

export type PlayerProfile = {
  nickname: string;
  className: string;
  archetype: string;
  focusArea: string;
  level: number;
  motivationStyle: string;
  onboardingCompletedAt?: string;
  originNote: string;
  stats: PlayerStat[];
  weakSpot: string;
  xp: number;
  xpToNextLevel: number;
};

export type DailyEnergy = "low" | "steady" | "high";

export type DailyState = {
  date: string;
  energy: DailyEnergy;
  focus: string;
  reflection: string;
  completedQuestIds: string[];
  xpEarned: number;
  checkInAt?: string;
};

export type DailyLog = DailyState & {
  updatedAt: string;
};

export type QuestDifficulty = "easy" | "normal" | "hard" | "boss";

export type Quest = {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  difficulty?: QuestDifficulty;
  dueDate?: string;
  rewardXp?: number;
  statPoints?: number;
  statReward?: string;
};

export type QuestGroup = {
  id: string;
  title: string;
  description: string;
  quests: Quest[];
  createdAt: string;
};

export type KnowledgeNote = {
  id: string;
  title: string;
  body: string;
  kind?: KnowledgeNoteKind;
  tags?: string[];
  linkedInventoryItemId?: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeNoteKind = "note" | "rule" | "decision" | "link" | "reference";

export type InventoryCategory = "document" | "idea" | "resource" | "contact" | "artifact" | "purchase" | "project";

export type InventoryItem = {
  id: string;
  title: string;
  category: InventoryCategory;
  notes: string;
  link: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressEventKind = "check_in" | "quest_completed" | "note_created" | "inventory_item_created" | "wallet_added" | "achievement_unlocked";

export type ProgressEvent = {
  id: string;
  kind: ProgressEventKind;
  title: string;
  detail: string;
  xp: number;
  createdAt: string;
};

export type PlayerAchievement = {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
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
  network: string;
  symbol: string;
  amount: number;
  usdValue: number;
  contractAddress?: string;
  isPriced?: boolean;
};

export type ProviderConfig = {
  alchemyApiKey: string;
  heliusApiKey: string;
  enabledEvmNetworks: EvmNetworkId[];
  hideUnpricedTokens: boolean;
  minUsdValue: number;
};

export type BalanceRefreshResult = {
  balances: TokenBalance[];
  errors: string[];
  updatedAt: string;
};

export type EvmNetworkId = "ethereum" | "arbitrum" | "base" | "optimism" | "polygon";

export type EvmNetwork = {
  id: EvmNetworkId;
  label: string;
  alchemyNetwork: string;
  nativeSymbol: string;
};

type BalanceWithWarnings = {
  balances: TokenBalance[];
  warnings: string[];
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
  className: "Unassigned",
  archetype: "Unmapped",
  focusArea: "General",
  level: 1,
  motivationStyle: "Unknown",
  originNote: "",
  stats: playerStats,
  weakSpot: "Unmapped",
  xp: 0,
  xpToNextLevel: 100
};

export const evmNetworks: EvmNetwork[] = [
  { id: "ethereum", label: "Ethereum", alchemyNetwork: "eth-mainnet", nativeSymbol: "ETH" },
  { id: "arbitrum", label: "Arbitrum", alchemyNetwork: "arb-mainnet", nativeSymbol: "ETH" },
  { id: "base", label: "Base", alchemyNetwork: "base-mainnet", nativeSymbol: "ETH" },
  { id: "optimism", label: "Optimism", alchemyNetwork: "opt-mainnet", nativeSymbol: "ETH" },
  { id: "polygon", label: "Polygon", alchemyNetwork: "polygon-mainnet", nativeSymbol: "MATIC" }
];

export const defaultProviderConfig: ProviderConfig = {
  alchemyApiKey: "",
  heliusApiKey: "",
  enabledEvmNetworks: ["ethereum", "arbitrum", "base", "optimism", "polygon"],
  hideUnpricedTokens: false,
  minUsdValue: 1
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

export const inventoryCategories: Array<{ id: InventoryCategory; label: string }> = [
  { id: "document", label: "Documents" },
  { id: "idea", label: "Ideas" },
  { id: "resource", label: "Resources" },
  { id: "contact", label: "Contacts" },
  { id: "artifact", label: "Artifacts" },
  { id: "purchase", label: "Purchases" },
  { id: "project", label: "Projects" }
];

export const achievementCatalog: PlayerAchievement[] = [
  {
    id: "first-check-in",
    title: "First Check-In",
    description: "Save your first daily check-in."
  },
  {
    id: "first-quest",
    title: "First Quest",
    description: "Complete your first quest."
  },
  {
    id: "quest-starter",
    title: "Quest Starter",
    description: "Complete three quests."
  },
  {
    id: "first-note",
    title: "First Note",
    description: "Create your first knowledge note."
  },
  {
    id: "first-inventory-item",
    title: "Inventory Seed",
    description: "Add your first inventory item."
  },
  {
    id: "first-wallet",
    title: "Asset Link",
    description: "Add your first tracked wallet."
  }
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

const REQUEST_TIMEOUT_MS = 12_000;
const TOKEN_METADATA_LIMIT = 25;
const SOLANA_ASSET_LIMIT = 250;
const coingeckoIdsBySymbol: Record<string, string> = {
  ETH: "ethereum",
  MATIC: "matic-network",
  SOL: "solana"
};

const coingeckoPlatformsByAlchemyNetwork: Record<string, string> = {
  "arb-mainnet": "arbitrum-one",
  "base-mainnet": "base",
  "eth-mainnet": "ethereum",
  "opt-mainnet": "optimistic-ethereum",
  "polygon-mainnet": "polygon-pos"
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
  return createEntityId("wallet");
}

export function createEntityId(prefix = "entity"): string {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
        network: wallet.chain,
        symbol: token.symbol,
        amount,
        usdValue: amount * token.price
      };
    })
  );
}

export async function refreshBalances(wallets: WalletAddress[], config: ProviderConfig): Promise<BalanceRefreshResult> {
  const errors: string[] = [];
  const balances: TokenBalance[] = [];

  const evmWallets = wallets.filter((wallet) => wallet.chain === "evm");
  const solanaWallets = wallets.filter((wallet) => wallet.chain === "solana");

  if (evmWallets.length > 0 && config.alchemyApiKey.trim()) {
    const evmResults = await Promise.all(evmWallets.flatMap((wallet) =>
      config.enabledEvmNetworks.flatMap((networkId) => {
        const network = evmNetworks.find((item) => item.id === networkId);
        if (!network) return [];

        return [fetchEvmBalances(wallet, network, config.alchemyApiKey.trim())
          .then((result) => ({ balances: result.balances, errors: result.warnings }))
          .catch((error) => ({ balances: [], errors: [`${wallet.label} / ${network.label}: ${getErrorMessage(error)}`] }))];
      })
    ));

    evmResults.forEach((result) => {
      balances.push(...result.balances);
      errors.push(...result.errors);
    });
  } else if (evmWallets.length > 0) {
    errors.push("Alchemy API key is missing.");
  }

  if (solanaWallets.length > 0 && config.heliusApiKey.trim()) {
    const solanaResults = await Promise.all(solanaWallets.map((wallet) =>
      fetchSolanaBalances(wallet, config.heliusApiKey.trim(), config.alchemyApiKey.trim())
        .then((items) => ({ balances: items, errors: [] }))
        .catch((error) => ({ balances: [], errors: [`${wallet.label} / Solana: ${getErrorMessage(error)}`] }))
    ));

    solanaResults.forEach((result) => {
      balances.push(...result.balances);
      errors.push(...result.errors);
    });
  } else if (solanaWallets.length > 0) {
    errors.push("Helius API key is missing.");
  }

  return {
    balances: balances.filter((balance) => isVisibleBalance(balance, config.minUsdValue)),
    errors,
    updatedAt: new Date().toISOString()
  };
}

async function fetchEvmBalances(wallet: WalletAddress, network: EvmNetwork, apiKey: string): Promise<BalanceWithWarnings> {
  const warnings: string[] = [];
  const rpcUrl = `https://${network.alchemyNetwork}.g.alchemy.com/v2/${apiKey}`;
  const [nativeBalanceHex, tokenResponse] = await Promise.all([
    alchemyRpc<string>(rpcUrl, "eth_getBalance", [wallet.address, "latest"]),
    alchemyRpc<{ tokenBalances: Array<{ contractAddress: string; tokenBalance: string }> }>(
    rpcUrl,
    "alchemy_getTokenBalances",
    [wallet.address, "erc20"]
    )
  ]);

  const nonZeroTokens = tokenResponse.tokenBalances
    .filter((token) => token.tokenBalance && BigInt(token.tokenBalance) > 0n)
    .slice(0, TOKEN_METADATA_LIMIT);

  const metadata = await Promise.all(nonZeroTokens.map((token) =>
    alchemyRpc<{ name?: string; symbol?: string; decimals?: number | string }>(
      rpcUrl,
      "alchemy_getTokenMetadata",
      [token.contractAddress]
    ).catch(() => null)
  ));

  const priceByAddress = await fetchAlchemyPricesByAddress(
    apiKey,
    network.alchemyNetwork,
    nonZeroTokens.map((token) => token.contractAddress)
  ).catch((error) => {
    warnings.push(`${wallet.label} / ${network.label}: token prices unavailable (${getErrorMessage(error)})`);
    return new Map<string, number>();
  });
  const missingPriceAddresses = nonZeroTokens
    .map((token) => token.contractAddress)
    .filter(isValidEvmContractAddress)
    .filter((address) => !priceByAddress.has(address.toLowerCase()));
  const fallbackPriceByAddress = await fetchCoinGeckoTokenPrices(network.alchemyNetwork, missingPriceAddresses)
    .catch(() => new Map<string, number>());
  fallbackPriceByAddress.forEach((value, address) => priceByAddress.set(address, value));
  const nativePriceBySymbol = await fetchNativePricesBySymbol(apiKey, [network.nativeSymbol]).catch((error) => {
    warnings.push(`${wallet.label} / ${network.label}: native price unavailable (${getErrorMessage(error)})`);
    return new Map<string, number>();
  });

  const nativeAmount = formatUnitsToNumber(nativeBalanceHex, 18);
  const nativePrice = nativePriceBySymbol.get(network.nativeSymbol) ?? 0;
  const nativeBalance = nativeAmount > 0
    ? [{
      walletId: wallet.id,
      walletLabel: wallet.label,
      chain: "evm" as const,
      network: network.label,
      symbol: network.nativeSymbol,
      amount: nativeAmount,
      usdValue: nativePrice > 0 ? nativeAmount * nativePrice : 0,
      isPriced: nativePrice > 0
    }]
    : [];

  const erc20Balances = nonZeroTokens.flatMap((token, index) => {
    const meta = metadata[index];
    const symbol = meta?.symbol?.trim() || shortAddress(token.contractAddress);

    const decimals = Number(meta?.decimals ?? 18);
    const amount = formatUnitsToNumber(token.tokenBalance, decimals);
    const price = priceByAddress.get(token.contractAddress.toLowerCase()) ?? 0;

    if (!Number.isFinite(amount) || amount <= 0) {
      return [];
    }

    return [{
      walletId: wallet.id,
      walletLabel: wallet.label,
      chain: "evm" as const,
      network: network.label,
      symbol,
      amount,
      usdValue: price > 0 ? amount * price : 0,
      contractAddress: token.contractAddress,
      isPriced: price > 0
    }];
  });

  if (nonZeroTokens.length >= TOKEN_METADATA_LIMIT) {
    warnings.push(`${wallet.label} / ${network.label}: showing first ${TOKEN_METADATA_LIMIT} non-zero ERC-20 balances`);
  }

  return { balances: [...nativeBalance, ...erc20Balances], warnings };
}

async function fetchSolanaBalances(wallet: WalletAddress, apiKey: string, priceApiKey: string): Promise<TokenBalance[]> {
  const response = await fetchWithTimeout(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "sil-get-assets",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: wallet.address,
        page: 1,
        limit: SOLANA_ASSET_LIMIT,
        displayOptions: {
          showFungible: true
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Helius HTTP ${response.status}`);
  }

  const payload = await response.json() as {
    error?: { message?: string };
    result?: { items?: unknown[] };
  };

  if (payload.error) {
    throw new Error(payload.error.message ?? "Helius RPC error");
  }

  const tokenBalances = (payload.result?.items ?? []).flatMap((item) => parseHeliusAsset(item, wallet));
  const nativeBalance = await fetchSolanaNativeBalance(wallet, apiKey, priceApiKey);

  return [...nativeBalance, ...tokenBalances];
}

async function alchemyRpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "sil-rpc",
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`Alchemy HTTP ${response.status}`);
  }

  const payload = await response.json() as { error?: { message?: string }; result?: T };

  if (payload.error) {
    throw new Error(payload.error.message ?? "Alchemy RPC error");
  }

  if (!payload.result) {
    throw new Error("Alchemy RPC returned no result");
  }

  return payload.result;
}

async function fetchAlchemyPricesByAddress(apiKey: string, network: string, contractAddresses: string[]): Promise<Map<string, number>> {
  if (contractAddresses.length === 0) {
    return new Map();
  }

  const response = await fetchWithTimeout("https://api.g.alchemy.com/prices/v1/tokens/by-address", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      addresses: contractAddresses.map((address) => ({ network, address }))
    })
  });

  if (!response.ok) {
    throw new Error(`Alchemy Prices HTTP ${response.status}`);
  }

  const payload = await response.json() as {
    data?: Array<{
      address?: string;
      prices?: Array<{ currency?: string; value?: string }>;
    }>;
  };

  return new Map((payload.data ?? []).flatMap((item) => {
    const usd = item.prices?.find((price) => price.currency === "USD");
    const value = Number(usd?.value);
    if (!item.address || !Number.isFinite(value)) return [];
    return [[item.address.toLowerCase(), value] as const];
  }));
}

async function fetchNativePricesBySymbol(apiKey: string, symbols: string[]): Promise<Map<string, number>> {
  const prices = apiKey
    ? await fetchAlchemyPricesBySymbol(apiKey, symbols).catch(() => new Map<string, number>())
    : new Map<string, number>();
  const missingSymbols = symbols.filter((symbol) => !prices.has(symbol.toUpperCase()));

  if (missingSymbols.length === 0) {
    return prices;
  }

  const fallbackPrices = await fetchCoinGeckoNativePrices(missingSymbols).catch(() => new Map<string, number>());
  fallbackPrices.forEach((value, symbol) => prices.set(symbol, value));

  return prices;
}

async function fetchAlchemyPricesBySymbol(apiKey: string, symbols: string[]): Promise<Map<string, number>> {
  const uniqueSymbols = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
  if (uniqueSymbols.length === 0) {
    return new Map();
  }

  const params = new URLSearchParams();
  uniqueSymbols.forEach((symbol) => params.append("symbols", symbol));

  const response = await fetchWithTimeout(`https://api.g.alchemy.com/prices/v1/tokens/by-symbol?${params.toString()}`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Alchemy Prices HTTP ${response.status}`);
  }

  const payload = await response.json() as {
    data?: Array<{
      symbol?: string;
      prices?: Array<{ currency?: string; value?: string }>;
    }>;
  };

  return new Map((payload.data ?? []).flatMap((item) => {
    const usd = item.prices?.find((price) => price.currency === "USD");
    const value = Number(usd?.value);
    if (!item.symbol || !Number.isFinite(value)) return [];
    return [[item.symbol.toUpperCase(), value] as const];
  }));
}

async function fetchCoinGeckoNativePrices(symbols: string[]): Promise<Map<string, number>> {
  const symbolById = new Map<string, string>();

  symbols.forEach((symbol) => {
    const normalized = symbol.trim().toUpperCase();
    const id = coingeckoIdsBySymbol[normalized];
    if (id) {
      symbolById.set(id, normalized);
    }
  });

  if (symbolById.size === 0) {
    return new Map();
  }

  const params = new URLSearchParams({
    ids: [...symbolById.keys()].join(","),
    vs_currencies: "usd"
  });

  const response = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/price?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`CoinGecko HTTP ${response.status}`);
  }

  const payload = await response.json() as Record<string, { usd?: number }>;

  return new Map(Object.entries(payload).flatMap(([id, item]) => {
    const symbol = symbolById.get(id);
    const value = Number(item.usd);

    if (!symbol || !Number.isFinite(value) || value <= 0) {
      return [];
    }

    return [[symbol, value] as const];
  }));
}

async function fetchCoinGeckoTokenPrices(alchemyNetwork: string, contractAddresses: string[]): Promise<Map<string, number>> {
  const platform = coingeckoPlatformsByAlchemyNetwork[alchemyNetwork];
  const uniqueAddresses = [...new Set(contractAddresses
    .map((address) => address.toLowerCase())
    .filter(isValidEvmContractAddress)
  )];

  if (!platform || uniqueAddresses.length === 0) {
    return new Map();
  }

  const params = new URLSearchParams({
    contract_addresses: uniqueAddresses.join(","),
    vs_currencies: "usd"
  });

  const response = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/token_price/${platform}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`CoinGecko token price HTTP ${response.status}`);
  }

  const payload = await response.json() as Record<string, { usd?: number }>;

  return new Map(Object.entries(payload).flatMap(([address, item]) => {
    const value = Number(item.usd);

    if (!Number.isFinite(value) || value <= 0) {
      return [];
    }

    return [[address.toLowerCase(), value] as const];
  }));
}

function isValidEvmContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

async function fetchSolanaNativeBalance(wallet: WalletAddress, heliusApiKey: string, alchemyApiKey: string): Promise<TokenBalance[]> {
  const balanceResponse = await fetchWithTimeout(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "sil-get-sol-balance",
      method: "getBalance",
      params: [wallet.address]
    })
  });

  if (!balanceResponse.ok) {
    throw new Error(`Helius getBalance HTTP ${balanceResponse.status}`);
  }

  const payload = await balanceResponse.json() as {
    error?: { message?: string };
    result?: { value?: number };
  };

  if (payload.error) {
    throw new Error(payload.error.message ?? "Helius getBalance error");
  }

  const lamports = Number(payload.result?.value ?? 0);
  const amount = lamports / 1_000_000_000;
  const price = alchemyApiKey
    ? (await fetchNativePricesBySymbol(alchemyApiKey, ["SOL"]).catch(() => new Map<string, number>())).get("SOL") ?? 0
    : (await fetchNativePricesBySymbol("", ["SOL"]).catch(() => new Map<string, number>())).get("SOL") ?? 0;

  if (!Number.isFinite(amount) || amount <= 0) {
    return [];
  }

  return [{
    walletId: wallet.id,
    walletLabel: wallet.label,
    chain: "solana",
    network: "Solana",
    symbol: "SOL",
    amount,
    usdValue: price > 0 ? amount * price : 0,
    isPriced: price > 0
  }];
}

function parseHeliusAsset(item: unknown, wallet: WalletAddress): TokenBalance[] {
  if (!item || typeof item !== "object") return [];

  const asset = item as {
    id?: string;
    interface?: string;
    content?: { metadata?: { symbol?: string; name?: string } };
    token_info?: {
      balance?: number | string;
      decimals?: number;
      symbol?: string;
      price_info?: {
        price_per_token?: number;
        total_price?: number;
      };
    };
  };

  if (asset.interface && !asset.interface.toLowerCase().includes("fungible")) {
    return [];
  }

  const symbol = asset.token_info?.symbol ?? asset.content?.metadata?.symbol;
  const rawBalance = Number(asset.token_info?.balance ?? 0);
  const decimals = Number(asset.token_info?.decimals ?? 0);
  const amount = rawBalance / 10 ** decimals;
  const totalPrice = Number(asset.token_info?.price_info?.total_price ?? 0);
  const pricePerToken = Number(asset.token_info?.price_info?.price_per_token ?? 0);
  const usdValue = totalPrice > 0 ? totalPrice : amount * pricePerToken;

  if (!symbol || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(usdValue) || usdValue <= 0) {
    return [];
  }

  return [{
    walletId: wallet.id,
    walletLabel: wallet.label,
    chain: "solana",
    network: "Solana",
    symbol,
    amount,
    usdValue,
    contractAddress: asset.id
  }];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isVisibleBalance(balance: TokenBalance, minUsdValue: number): boolean {
  if (!Number.isFinite(balance.amount) || balance.amount <= 0) {
    return false;
  }

  if (balance.isPriced === false) {
    return true;
  }

  return Number.isFinite(balance.usdValue) && balance.usdValue >= minUsdValue;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function getPortfolioTotals(balances: TokenBalance[]) {
  return balances.reduce(
    (totals, balance) => {
      if (balance.isPriced === false) {
        return totals;
      }

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

function formatUnitsToNumber(hexValue: string, decimals: number): number {
  const raw = BigInt(hexValue);
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");

  return Number(fractionText ? `${whole.toString()}.${fractionText}` : whole.toString());
}
