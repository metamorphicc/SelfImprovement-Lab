"use client";

import {
  BookOpen,
  Brain,
  CheckSquare,
  ChevronRight,
  CircleDollarSign,
  Languages,
  Menu,
  Package,
  Palette,
  Settings,
  Shield,
  User,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Chain,
  PlayerProfile,
  TokenBalance,
  WalletAddress,
  createWalletId,
  defaultProfile,
  formatAmount,
  formatUsd,
  getPortfolioTotals,
  inventorySlots,
  isValidWalletAddress,
  playerStats,
  shortAddress
} from "@sil/core";
import { readLocalState, writeLocalState } from "@/lib/local-db";

type Section = "profile" | "wallets" | "inventory" | "quests" | "skills" | "knowledge" | "settings";
type Language = "en" | "ru";
type Theme = "milk" | "cocoa";

const sections: Array<{ id: Section; labels: Record<Language, string>; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "profile", labels: { en: "Profile", ru: "Профиль" }, icon: User },
  { id: "wallets", labels: { en: "Wallets", ru: "Кошельки" }, icon: CircleDollarSign },
  { id: "inventory", labels: { en: "Inventory", ru: "Инвентарь" }, icon: Package },
  { id: "quests", labels: { en: "Quests", ru: "Квесты" }, icon: CheckSquare },
  { id: "skills", labels: { en: "Skills", ru: "Навыки" }, icon: Brain },
  { id: "knowledge", labels: { en: "Knowledge", ru: "Знания" }, icon: BookOpen },
  { id: "settings", labels: { en: "Settings", ru: "Настройки" }, icon: Settings }
];

const t = {
  en: {
    app: {
      commandCenter: "Command Center",
      local: "Local DB",
      statusTitle: "Prototype Status",
      statusText: "Profile, wallets, theme, and language are saved locally in IndexedDB."
    },
    sections: {
      profile: ["Player Profile", "Profile, XP, stats, and character preview."],
      wallets: ["Wallets", "Tracked addresses. Real balance providers are not connected yet."],
      inventory: ["Inventory", "A compact inventory of files, resources, projects, and useful things."],
      quests: ["Quests", "Daily tasks and story arcs will live here."],
      skills: ["Skills", "Starting skill values are zero until onboarding assigns them."],
      knowledge: ["Knowledge", "Your structured second brain."],
      settings: ["Settings", "Language, theme, and local preferences."]
    },
    profile: {
      kicker: "Player profile",
      classLine: "Class: unassigned",
      description: "The first-registration interview will generate class, stats, starter quests, weak spots, and inventory.",
      nickname: "Nickname",
      save: "Save",
      xp: "Experience",
      stats: "Stats",
      draft: "initial values",
      assets: "Asset Overview",
      today: "Today",
      quests: "daily quests",
      addresses: "addresses",
      address: "address"
    },
    wallets: {
      connected: "Connected Addresses",
      localList: "local database",
      label: "Label",
      network: "Network",
      address: "Address",
      add: "Add Address",
      placeholderLabel: "Main, cold, trading",
      placeholderAddress: "0x... or Solana address",
      noAddresses: "No addresses yet",
      firstWallet: "Add your first wallet",
      persisted: "Saved locally in IndexedDB.",
      remove: "Remove",
      tokens: "Tokens",
      providerMissing: "provider not connected",
      threshold: "USD threshold",
      noAssets: "Real balance providers are not connected yet, so the app is not estimating your portfolio.",
      duplicate: "This address is already in the list.",
      added: "Address saved.",
      evmInvalid: "EVM addresses must start with 0x and contain 40 hex characters.",
      solanaInvalid: "Solana addresses must be a base58 string with 32-44 characters."
    },
    settings: {
      preferences: "Preferences",
      interface: "interface",
      language: "Language",
      theme: "Theme",
      english: "English",
      russian: "Russian",
      milk: "Milk",
      cocoa: "Cocoa",
      noteTitle: "Onboarding note",
      note: "Interview is not a normal tab. It should run once during first registration and generate the profile."
    },
    placeholders: {
      questsTitle: "Quest Log",
      questsBody: "Daily missions, story arcs, rewards, cooldowns, and level history will live here.",
      knowledgeTitle: "Knowledge Base",
      knowledgeBody: "Notes, rules, decisions, links, and references will be organized here."
    }
  },
  ru: {
    app: {
      commandCenter: "Командный центр",
      local: "Локальная БД",
      statusTitle: "Статус прототипа",
      statusText: "Профиль, кошельки, тема и язык сохраняются локально в IndexedDB."
    },
    sections: {
      profile: ["Профиль игрока", "Профиль, опыт, навыки и модель персонажа."],
      wallets: ["Кошельки", "Отслеживаемые адреса. Реальные провайдеры баланса пока не подключены."],
      inventory: ["Инвентарь", "Компактный учёт файлов, ресурсов, проектов и полезных вещей."],
      quests: ["Квесты", "Ежедневные задачи и сюжетные арки будут здесь."],
      skills: ["Навыки", "Стартовые значения равны нулю, пока onboarding не назначит билд."],
      knowledge: ["Знания", "Твоя структурированная вторая голова."],
      settings: ["Настройки", "Язык, тема и локальные предпочтения."]
    },
    profile: {
      kicker: "Профиль игрока",
      classLine: "Класс: не назначен",
      description: "Интервью при первой регистрации сгенерирует класс, характеристики, стартовые квесты, слабые места и инвентарь.",
      nickname: "Ник",
      save: "Сохранить",
      xp: "Опыт",
      stats: "Навыки",
      draft: "стартовые значения",
      assets: "Активы",
      today: "Сегодня",
      quests: "ежедневные квесты",
      addresses: "адресов",
      address: "адрес"
    },
    wallets: {
      connected: "Подключённые адреса",
      localList: "локальная база",
      label: "Название",
      network: "Сеть",
      address: "Адрес",
      add: "Добавить адрес",
      placeholderLabel: "Main, cold, trading",
      placeholderAddress: "0x... или Solana address",
      noAddresses: "Адресов пока нет",
      firstWallet: "Добавь первый кошелёк",
      persisted: "Сохраняется локально в IndexedDB.",
      remove: "Удалить",
      tokens: "Токены",
      providerMissing: "провайдер не подключён",
      threshold: "USD-порог",
      noAssets: "Реальные провайдеры балансов пока не подключены, поэтому приложение не оценивает портфель.",
      duplicate: "Этот адрес уже есть в списке.",
      added: "Адрес сохранён.",
      evmInvalid: "EVM адрес должен начинаться с 0x и содержать 40 hex-символов.",
      solanaInvalid: "Solana адрес должен быть base58 строкой длиной 32-44 символа."
    },
    settings: {
      preferences: "Предпочтения",
      interface: "интерфейс",
      language: "Язык",
      theme: "Тема",
      english: "Английский",
      russian: "Русский",
      milk: "Молочная",
      cocoa: "Какао",
      noteTitle: "Про onboarding",
      note: "Интервью не должно быть обычной вкладкой. Оно запускается один раз при первой регистрации и собирает профиль."
    },
    placeholders: {
      questsTitle: "Журнал квестов",
      questsBody: "Здесь будут ежедневки, сюжетные арки, награды, кулдауны и история уровней.",
      knowledgeTitle: "База знаний",
      knowledgeBody: "Заметки, правила, решения, ссылки и справки будут организованы здесь."
    }
  }
};

const questLabels = {
  en: ["Ten minutes of movement", "One deep work block", "Write a short day log"],
  ru: ["10 минут движения", "Один блок глубокой работы", "Короткий лог дня"]
};

const statLabels: Record<Language, Record<string, string>> = {
  en: {},
  ru: {
    Focus: "Фокус",
    Body: "Тело",
    Will: "Воля",
    Creative: "Креатив",
    Social: "Социальность",
    Discipline: "Дисциплина"
  }
};

export function SystemShell() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("milk");
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [threshold, setThreshold] = useState(1);
  const [message, setMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const text = t[language];

  const balances = useMemo<TokenBalance[]>(() => [], []);
  const visibleBalances = useMemo(
    () => balances.filter((balance) => balance.usdValue >= threshold).sort((a, b) => b.usdValue - a.usdValue),
    [balances, threshold]
  );
  const totals = useMemo(() => getPortfolioTotals(balances), [balances]);

  useEffect(() => {
    let active = true;

    readLocalState()
      .then((state) => {
        if (!active || !state) return;
        if (state.language) setLanguage(state.language);
        if (state.theme) setTheme(state.theme);
        if (state.profile) setProfile({ ...defaultProfile, ...state.profile });
        if (state.wallets) setWallets(state.wallets);
      })
      .finally(() => {
        if (active) setIsHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void writeLocalState({ language, profile, theme, wallets });
  }, [isHydrated, language, profile, theme, wallets]);

  function navigate(section: Section) {
    setActiveSection(section);
  }

  function addWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") || "").trim();
    const chain = String(form.get("chain") || "evm") as Chain;
    const address = String(form.get("address") || "").trim();

    if (!isValidWalletAddress(chain, address)) {
      setMessage(chain === "evm" ? text.wallets.evmInvalid : text.wallets.solanaInvalid);
      return;
    }

    if (wallets.some((wallet) => wallet.chain === chain && wallet.address.toLowerCase() === address.toLowerCase())) {
      setMessage(text.wallets.duplicate);
      return;
    }

    setWallets((current) => [
      ...current,
      {
        id: createWalletId(),
        label: label || `${chain.toUpperCase()} wallet`,
        chain,
        address,
        createdAt: new Date().toISOString()
      }
    ]);
    setMessage(text.wallets.added);
    event.currentTarget.reset();
  }

  const [title, subtitle] = text.sections[activeSection];

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <div>
            <strong>SYSTEM</strong>
            <span>Self Improvement Labs</span>
          </div>
          <button className="icon-button close-mobile" type="button" aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                className={`nav-item ${activeSection === section.id ? "active" : ""}`}
                key={section.id}
                type="button"
                onClick={() => navigate(section.id)}
              >
                <Icon size={16} />
                <span>{section.labels[language]}</span>
                <ChevronRight size={14} />
              </button>
            );
          })}
        </nav>

        <div className="status-panel">
          <Shield size={16} />
          <div>
            <strong>{text.app.statusTitle}</strong>
            <span>{text.app.statusText}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <div>
            <p className="kicker">{text.app.commandCenter}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="sync-pill">{text.app.local}</div>
        </header>

        {activeSection === "profile" && (
          <ProfileScreen
            language={language}
            profile={profile}
            setProfile={setProfile}
            text={text.profile}
            totals={totals}
            walletCount={wallets.length}
          />
        )}

        {activeSection === "wallets" && (
          <WalletsScreen
            addWallet={addWallet}
            message={message}
            removeWallet={(id) => setWallets((current) => current.filter((wallet) => wallet.id !== id))}
            setThreshold={setThreshold}
            text={text.wallets}
            threshold={threshold}
            visibleBalances={visibleBalances}
            wallets={wallets}
          />
        )}

        {activeSection === "inventory" && <InventoryScreen />}
        {activeSection === "quests" && <Placeholder title={text.placeholders.questsTitle} body={text.placeholders.questsBody} />}
        {activeSection === "skills" && <SkillsScreen language={language} />}
        {activeSection === "knowledge" && <Placeholder title={text.placeholders.knowledgeTitle} body={text.placeholders.knowledgeBody} />}
        {activeSection === "settings" && (
          <SettingsScreen
            language={language}
            setLanguage={setLanguage}
            setTheme={setTheme}
            text={text.settings}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}

function ProfileScreen({
  language,
  profile,
  setProfile,
  text,
  totals,
  walletCount
}: {
  language: Language;
  profile: PlayerProfile;
  setProfile: (profile: PlayerProfile) => void;
  text: typeof t.en.profile;
  totals: { total: number; evm: number; solana: number };
  walletCount: number;
}) {
  const xpPercent = Math.min(100, Math.max(0, (profile.xp / profile.xpToNextLevel) * 100));

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nickname = String(form.get("nickname") || "").trim();
    setProfile({ ...profile, nickname: nickname || defaultProfile.nickname });
  }

  return (
    <div className="screen-stack">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="kicker">{text.kicker}</p>
          <h2>{profile.nickname}</h2>
          <p>{text.description}</p>
          <form className="profile-editor" onSubmit={saveProfile}>
            <label>
              <span>{text.nickname}</span>
              <input name="nickname" defaultValue={profile.nickname} />
            </label>
            <button className="secondary-button" type="submit">{text.save}</button>
          </form>
          <div className="xp-block">
            <div className="xp-row">
              <span>{text.xp}</span>
              <strong>{profile.xp}/{profile.xpToNextLevel}</strong>
            </div>
            <div className="xp-track">
              <div style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
        <AvatarPreview level={profile.level} classLine={text.classLine} />
      </section>

      <div className="grid two">
        <section className="panel">
          <PanelTitle title={text.stats} meta={text.draft} />
          <SkillGrid language={language} />
        </section>

        <section className="panel">
          <PanelTitle title={text.assets} meta={`${walletCount} ${walletCount === 1 ? text.address : text.addresses}`} />
          <div className="portfolio-total">{formatUsd(totals.total)}</div>
          <div className="mini-bars">
            <div><span>EVM</span><strong>{formatUsd(totals.evm)}</strong></div>
            <div><span>Solana</span><strong>{formatUsd(totals.solana)}</strong></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title={text.today} meta={text.quests} />
        <div className="quest-row">
          {questLabels[language].map((quest) => (
            <label key={quest}>
              <input type="checkbox" />
              <span>{quest}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function AvatarPreview({ classLine, level }: { classLine: string; level: number }) {
  return (
    <div className="avatar-stage" aria-label="Full-body character preview">
      <div className="avatar-model">
        <div className="avatar-head" />
        <div className="avatar-neck" />
        <div className="avatar-body" />
        <div className="avatar-arm left" />
        <div className="avatar-arm right" />
        <div className="avatar-leg left" />
        <div className="avatar-leg right" />
      </div>
      <div className="avatar-shadow" />
      <div className="avatar-meta">
        <span>LV {level.toString().padStart(2, "0")}</span>
        <strong>{classLine}</strong>
      </div>
    </div>
  );
}

function WalletsScreen({
  addWallet,
  message,
  removeWallet,
  setThreshold,
  text,
  threshold,
  visibleBalances,
  wallets
}: {
  addWallet: (event: FormEvent<HTMLFormElement>) => void;
  message: string;
  removeWallet: (id: string) => void;
  setThreshold: (value: number) => void;
  text: typeof t.en.wallets;
  threshold: number;
  visibleBalances: TokenBalance[];
  wallets: WalletAddress[];
}) {
  return (
    <div className="grid wallet-layout">
      <section className="panel">
        <PanelTitle title={text.connected} meta={text.localList} />
        <form className="wallet-form" onSubmit={addWallet}>
          <label>
            <span>{text.label}</span>
            <input name="label" placeholder={text.placeholderLabel} />
          </label>
          <label>
            <span>{text.network}</span>
            <select name="chain" defaultValue="evm">
              <option value="evm">EVM</option>
              <option value="solana">Solana</option>
            </select>
          </label>
          <label className="address-field">
            <span>{text.address}</span>
            <input name="address" placeholder={text.placeholderAddress} />
          </label>
          <button className="primary-button" type="submit">{text.add}</button>
        </form>
        <p className="form-message">{message}</p>

        <div className="wallet-list">
          {wallets.length === 0 && (
            <div className="wallet-card">
              <span>{text.noAddresses}</span>
              <strong>{text.firstWallet}</strong>
              <code>{text.persisted}</code>
            </div>
          )}
          {wallets.map((wallet) => (
            <div className="wallet-card" key={wallet.id}>
              <span>{wallet.chain.toUpperCase()}</span>
              <strong>{wallet.label}</strong>
              <code title={wallet.address}>{shortAddress(wallet.address)}</code>
              <button type="button" onClick={() => removeWallet(wallet.id)}>{text.remove}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel assets-panel">
        <PanelTitle title={text.tokens} meta={text.providerMissing} />
        <label className="threshold-control">
          <span>{text.threshold}</span>
          <input min={0} onChange={(event) => setThreshold(Number(event.target.value || 0))} step={0.5} type="number" value={threshold} />
        </label>
        <div className="asset-table-wrap">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Network</th>
                <th>Balance</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {visibleBalances.length === 0 && (
                <tr>
                  <td colSpan={4}>{text.noAssets}</td>
                </tr>
              )}
              {visibleBalances.map((balance) => (
                <tr key={`${balance.walletId}-${balance.chain}-${balance.symbol}`}>
                  <td><strong>{balance.symbol}</strong><span>{balance.walletLabel}</span></td>
                  <td>{balance.chain.toUpperCase()}</td>
                  <td>{formatAmount(balance.amount)}</td>
                  <td>{formatUsd(balance.usdValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SkillsScreen({ language }: { language: Language }) {
  return (
    <section className="panel">
      <PanelTitle title={t[language].sections.skills[0]} meta={t[language].sections.skills[1]} />
      <SkillGrid language={language} />
    </section>
  );
}

function SkillGrid({ language }: { language: Language }) {
  return (
    <div className="stat-grid">
      {playerStats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <span>{statLabels[language][stat.label] ?? stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen({
  language,
  setLanguage,
  setTheme,
  text,
  theme
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  text: typeof t.en.settings;
  theme: Theme;
}) {
  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <PanelTitle title={text.preferences} meta={text.interface} />
        <div className="settings-control">
          <div className="settings-control-title">
            <Languages size={16} />
            <span>{text.language}</span>
          </div>
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            <option value="en">{text.english}</option>
            <option value="ru">{text.russian}</option>
          </select>
        </div>
        <div className="settings-control">
          <div className="settings-control-title">
            <Palette size={16} />
            <span>{text.theme}</span>
          </div>
          <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
            <option value="milk">{text.milk}</option>
            <option value="cocoa">{text.cocoa}</option>
          </select>
        </div>
      </section>

      <section className="panel settings-note">
        <PanelTitle title={text.noteTitle} meta="registration" />
        <p>{text.note}</p>
      </section>
    </div>
  );
}

function InventoryScreen() {
  return (
    <section className="inventory-grid">
      {inventorySlots.map((slot) => (
        <div key={slot}>{slot}</div>
      ))}
    </section>
  );
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <section className="panel placeholder">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function PanelTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      <span>{meta}</span>
    </div>
  );
}
