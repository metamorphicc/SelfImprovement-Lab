const walletStorageKey = "sil.wallets.v1";

const drawer = document.querySelector("#drawer");
const scrim = document.querySelector("#scrim");
const menuButton = document.querySelector("#menuButton");
const closeDrawerButton = document.querySelector("#closeDrawerButton");
const navItems = [...document.querySelectorAll(".nav-item")];
const screens = [...document.querySelectorAll(".screen")];
const walletForm = document.querySelector("#walletForm");
const walletLabel = document.querySelector("#walletLabel");
const walletChain = document.querySelector("#walletChain");
const walletAddress = document.querySelector("#walletAddress");
const walletMessage = document.querySelector("#walletMessage");
const walletList = document.querySelector("#walletList");
const assetRows = document.querySelector("#assetRows");
const thresholdInput = document.querySelector("#thresholdInput");
const portfolioTotal = document.querySelector("#portfolioTotal");
const evmTotal = document.querySelector("#evmTotal");
const solanaTotal = document.querySelector("#solanaTotal");
const walletCountLabel = document.querySelector("#walletCountLabel");

const demoTokens = {
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

let wallets = readWallets();

function openDrawer() {
  drawer.classList.add("open");
  scrim.classList.add("show");
}

function closeDrawer() {
  drawer.classList.remove("open");
  scrim.classList.remove("show");
}

function showSection(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === id));
  closeDrawer();
}

function readWallets() {
  try {
    return JSON.parse(localStorage.getItem(walletStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveWallets() {
  localStorage.setItem(walletStorageKey, JSON.stringify(wallets));
}

function isValidAddress(chain, address) {
  const trimmed = address.trim();
  if (chain === "evm") {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  }

  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
}

function shortAddress(address) {
  if (address.length <= 14) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeDemoAssets(wallet) {
  const seed = hashString(`${wallet.chain}:${wallet.address}`);
  const tokens = demoTokens[wallet.chain];

  return tokens.map((token, index) => {
    const base = ((seed >> (index % 12)) % 870) / 100;
    const amount = token.price > 100 ? base / 8 : token.price < 0.001 ? base * 100000 : base * 3;
    const value = amount * token.price;

    return {
      walletId: wallet.id,
      walletLabel: wallet.label,
      chain: wallet.chain,
      symbol: token.symbol,
      amount,
      value
    };
  });
}

function getVisibleAssets() {
  const threshold = Number(thresholdInput.value || 0);
  return wallets
    .flatMap(makeDemoAssets)
    .filter((asset) => asset.value >= threshold)
    .sort((a, b) => b.value - a.value);
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);
}

function formatAmount(value) {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}

function renderWallets() {
  walletList.innerHTML = "";

  if (wallets.length === 0) {
    walletList.innerHTML = '<div class="wallet-card"><div><span>No addresses</span><strong>Add your first wallet</strong><code>data is stored in this browser</code></div></div>';
    return;
  }

  wallets.forEach((wallet) => {
    const card = document.createElement("div");
    card.className = "wallet-card";
    card.innerHTML = `
      <div>
        <span>${wallet.chain.toUpperCase()}</span>
        <strong>${wallet.label}</strong>
        <code title="${wallet.address}">${shortAddress(wallet.address)}</code>
      </div>
      <button class="remove-wallet" type="button" aria-label="Remove address" data-id="${wallet.id}">x</button>
    `;
    walletList.append(card);
  });
}

function renderAssets() {
  const assets = getVisibleAssets();
  assetRows.innerHTML = "";

  if (assets.length === 0) {
    assetRows.innerHTML = '<tr class="empty-row"><td colspan="4">No assets above the selected threshold</td></tr>';
  } else {
    assets.forEach((asset) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${asset.symbol}</strong><br><span>${asset.walletLabel}</span></td>
        <td>${asset.chain.toUpperCase()}</td>
        <td>${formatAmount(asset.amount)}</td>
        <td>${formatUsd(asset.value)}</td>
      `;
      assetRows.append(row);
    });
  }

  const totals = wallets
    .flatMap(makeDemoAssets)
    .reduce((acc, asset) => {
      acc.total += asset.value;
      acc[asset.chain] += asset.value;
      return acc;
    }, { total: 0, evm: 0, solana: 0 });

  portfolioTotal.textContent = formatUsd(totals.total);
  evmTotal.textContent = formatUsd(totals.evm);
  solanaTotal.textContent = formatUsd(totals.solana);
  walletCountLabel.textContent = `${wallets.length} ${wallets.length === 1 ? "address" : "addresses"}`;
}

function renderAll() {
  renderWallets();
  renderAssets();
}

menuButton.addEventListener("click", openDrawer);
closeDrawerButton.addEventListener("click", closeDrawer);
scrim.addEventListener("click", closeDrawer);

navItems.forEach((item) => {
  item.addEventListener("click", () => showSection(item.dataset.section));
});

walletForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const chain = walletChain.value;
  const address = walletAddress.value.trim();
  const label = walletLabel.value.trim() || `${chain.toUpperCase()} wallet`;

  if (!isValidAddress(chain, address)) {
    walletMessage.textContent = chain === "evm"
      ? "EVM addresses must start with 0x and contain 40 hex characters."
      : "Solana addresses must be a base58 string with 32-44 characters.";
    return;
  }

  const duplicate = wallets.some((wallet) => wallet.chain === chain && wallet.address.toLowerCase() === address.toLowerCase());
  if (duplicate) {
    walletMessage.textContent = "This address is already in the list.";
    return;
  }

  wallets.push({
    id: createId(),
    label,
    chain,
    address,
    createdAt: new Date().toISOString()
  });

  saveWallets();
  walletForm.reset();
  walletMessage.textContent = "Address added.";
  renderAll();
});

walletList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-wallet");
  if (!button) {
    return;
  }

  wallets = wallets.filter((wallet) => wallet.id !== button.dataset.id);
  saveWallets();
  renderAll();
});

thresholdInput.addEventListener("input", renderAssets);

renderAll();
