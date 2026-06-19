"use client";

import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  CircleDollarSign,
  Download,
  Languages,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  Settings,
  Shield,
  Trophy,
  Upload,
  User,
  X
} from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Chain,
  DailyEnergy,
  DailyLog,
  DailyState,
  InventoryCategory,
  InventoryItem,
  KnowledgeNote,
  KnowledgeNoteKind,
  PlayerAchievement,
  PlayerProfile,
  PlayerStat,
  ProgressEvent,
  ProviderConfig,
  Quest,
  QuestDifficulty,
  QuestGroup,
  TokenBalance,
  WalletAddress,
  achievementCatalog,
  createEntityId,
  createWalletId,
  defaultProviderConfig,
  defaultProfile,
  evmNetworks,
  formatAmount,
  formatUsd,
  getPortfolioTotals,
  inventoryCategories,
  isValidWalletAddress,
  playerStats,
  refreshBalances,
  shortAddress
} from "@sil/core";
import { readLocalState, writeLocalState, type LocalAppState } from "@/lib/local-db";

type Section = "dashboard" | "today" | "profile" | "progress" | "wallets" | "inventory" | "quests" | "skills" | "knowledge" | "settings";
type Language = "en" | "ru";
type Theme = "milk" | "cocoa";
type BackupState = Omit<LocalAppState, "providers"> & {
  providers: Omit<ProviderConfig, "alchemyApiKey" | "heliusApiKey">;
};
type BackupDocument = {
  app: "self-improvement-labs";
  exportedAt: string;
  state: BackupState;
  version: 1;
};

const sections: Array<{ id: Section; labels: Record<Language, string>; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "dashboard", labels: { en: "Dashboard", ru: "Обзор" }, icon: LayoutDashboard },
  { id: "today", labels: { en: "Today", ru: "Сегодня" }, icon: CalendarDays },
  { id: "profile", labels: { en: "Profile", ru: "Профиль" }, icon: User },
  { id: "progress", labels: { en: "Progress", ru: "Прогресс" }, icon: Trophy },
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
      dashboard: ["Dashboard", "System overview, quick signals, and the next best actions."],
      today: ["Today", "Daily check-in, focus, quests, and XP loop."],
      profile: ["Player Profile", "Profile, XP, stats, and character preview."],
      progress: ["Progress", "Achievements, XP history, and local progression events."],
      wallets: ["Wallets", "Tracked addresses with Alchemy and Helius balance providers."],
      inventory: ["Inventory", "A compact inventory of files, resources, projects, and useful things."],
      quests: ["Quests", "Daily tasks and story arcs will live here."],
      skills: ["Skills", "Starting skill values are zero until onboarding assigns them."],
      knowledge: ["Knowledge", "Your structured second brain."],
      settings: ["Settings", "Language, theme, and local preferences."]
    },
    profile: {
      kicker: "Player profile",
      classLine: "Class: unassigned",
      description: "Generated from the first-registration interview: class, stats, starter quests, weak spot, and operating style.",
      nickname: "Nickname",
      save: "Save",
      xp: "Experience",
      stats: "Stats",
      archetype: "Archetype",
      className: "Class",
      draft: "initial values",
      focusArea: "Main arc",
      motivationStyle: "Motivation",
      weakSpot: "Weak spot",
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
      providerMissing: "Alchemy + Helius",
      threshold: "USD threshold",
      refresh: "Refresh balances",
      refreshing: "Refreshing...",
      lastUpdated: "Last updated",
      neverUpdated: "Not refreshed yet",
      noAssets: "No priced assets above the selected threshold.",
      unpriced: "Unpriced",
      hideUnpriced: "Hide unpriced tokens",
      duplicate: "This address is already in the list.",
      added: "Address saved.",
      evmInvalid: "EVM addresses must start with 0x and contain 40 hex characters.",
      solanaInvalid: "Solana addresses must be a base58 string with 32-44 characters."
    },
    settings: {
      preferences: "Preferences",
      interface: "interface",
      providers: "Balance Providers",
      providersMeta: "local API keys",
      alchemy: "Alchemy API Key",
      helius: "Helius API Key",
      hideUnpriced: "Hide unpriced tokens",
      minUsd: "Minimum USD value",
      evmNetworks: "EVM networks",
      language: "Language",
      keyPlaceholder: "Stored only on this device",
      theme: "Theme",
      english: "English",
      russian: "Russian",
      milk: "Milk",
      cocoa: "Cocoa",
      noteTitle: "Onboarding note",
      registration: "registration",
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
      dashboard: ["Обзор", "Сводка системы, ключевые показатели и следующие действия."],
      today: ["Сегодня", "Ежедневный отчёт, фокус, квесты и цикл XP."],
      profile: ["Профиль игрока", "Профиль, опыт, навыки и модель персонажа."],
      progress: ["Прогресс", "Достижения, история опыта и события развития персонажа."],
      wallets: ["Кошельки", "Отслеживаемые EVM- и Solana-адреса с актуальными балансами."],
      inventory: ["Инвентарь", "Компактный учёт файлов, ресурсов, проектов и полезных вещей."],
      quests: ["Квесты", "Ежедневные задачи и сюжетные арки будут здесь."],
      skills: ["Навыки", "Характеристики персонажа и их развитие через квесты."],
      knowledge: ["Знания", "Твоя структурированная вторая голова."],
      settings: ["Настройки", "Язык, тема и локальные предпочтения."]
    },
    profile: {
      kicker: "Профиль игрока",
      classLine: "Класс: не назначен",
      description: "Сгенерировано из интервью первой регистрации: класс, навыки, стартовые квесты, слабое место и стиль работы.",
      nickname: "Ник",
      save: "Сохранить",
      xp: "Опыт",
      stats: "Навыки",
      archetype: "Архетип",
      className: "Класс",
      draft: "стартовые значения",
      focusArea: "Главная арка",
      motivationStyle: "Мотивация",
      weakSpot: "Слабое место",
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
      placeholderLabel: "Основной, холодный, торговый",
      placeholderAddress: "0x... или адрес Solana",
      noAddresses: "Адресов пока нет",
      firstWallet: "Добавь первый кошелёк",
      persisted: "Сохраняется локально в IndexedDB.",
      remove: "Удалить",
      tokens: "Токены",
      providerMissing: "Alchemy + Helius",
      threshold: "USD-порог",
      refresh: "Обновить балансы",
      refreshing: "Обновляю...",
      lastUpdated: "Обновлено",
      neverUpdated: "Ещё не обновлялось",
      noAssets: "Нет оценённых активов выше выбранного порога.",
      unpriced: "Без цены",
      hideUnpriced: "Скрыть токены без цены",
      duplicate: "Этот адрес уже есть в списке.",
      added: "Адрес сохранён.",
      evmInvalid: "EVM-адрес должен начинаться с 0x и содержать 40 шестнадцатеричных символов.",
      solanaInvalid: "Адрес Solana должен быть строкой base58 длиной 32-44 символа."
    },
    settings: {
      preferences: "Предпочтения",
      interface: "интерфейс",
      providers: "Провайдеры балансов",
      providersMeta: "локальные API-ключи",
      alchemy: "Alchemy API Key",
      helius: "Helius API Key",
      hideUnpriced: "Скрыть токены без цены",
      minUsd: "Минимум USD",
      evmNetworks: "EVM-сети",
      language: "Язык",
      keyPlaceholder: "Хранится только на этом устройстве",
      theme: "Тема",
      english: "Английский",
      russian: "Русский",
      milk: "Молочная",
      cocoa: "Какао",
      noteTitle: "О регистрации",
      registration: "регистрация",
      note: "Интервью не является обычной вкладкой. Оно запускается один раз при первой регистрации и создаёт профиль."
    },
    placeholders: {
      questsTitle: "Журнал квестов",
      questsBody: "Здесь будут ежедневки, сюжетные арки, награды, кулдауны и история уровней.",
      knowledgeTitle: "База знаний",
      knowledgeBody: "Заметки, правила, решения, ссылки и справки будут организованы здесь."
    }
  }
};

const onboardingText = {
  en: {
    eyebrow: "First registration",
    title: "Build your starting character",
    subtitle: "Answer a few questions. The system will create your class, starter stats, weak spot, and first quest group.",
    nickname: "What should the system call you?",
    focus: "What is your main arc right now?",
    bottleneck: "What slows you down most often?",
    energy: "What kind of tasks do you naturally finish?",
    commitment: "What daily commitment is realistic?",
    note: "What should be different in your life 30 days from now?",
    start: "Generate profile",
    focusOptions: {
      body: "Body and energy",
      craft: "Skill and career",
      money: "Money and assets",
      mind: "Knowledge and clarity",
      order: "Routine and discipline"
    },
    bottleneckOptions: {
      chaos: "Too much chaos",
      avoidance: "Avoiding hard things",
      fatigue: "Low energy",
      distraction: "Too many distractions",
      doubt: "Overthinking"
    },
    energyOptions: {
      solo: "Solo deep work",
      tactical: "Small tactical wins",
      social: "Accountability with people",
      creative: "Open creative sessions"
    }
  },
  ru: {
    eyebrow: "Первая регистрация",
    title: "Собери стартового персонажа",
    subtitle: "Ответь на несколько вопросов. Система создаст класс, стартовые навыки, слабое место и первую группу квестов.",
    nickname: "Как системе тебя называть?",
    focus: "Какая у тебя главная арка сейчас?",
    bottleneck: "Что чаще всего тебя тормозит?",
    energy: "Какие задачи ты естественно доводишь до конца?",
    commitment: "Какой ежедневный минимум реалистичен?",
    note: "Что должно измениться в твоей жизни через 30 дней?",
    start: "Сгенерировать профиль",
    focusOptions: {
      body: "Тело и энергия",
      craft: "Навык и карьера",
      money: "Деньги и активы",
      mind: "Знания и ясность",
      order: "Рутина и дисциплина"
    },
    bottleneckOptions: {
      chaos: "Слишком много хаоса",
      avoidance: "Избегаю сложного",
      fatigue: "Мало энергии",
      distraction: "Слишком много отвлечений",
      doubt: "Слишком много думаю"
    },
    energyOptions: {
      solo: "Глубокая работа в одиночку",
      tactical: "Маленькие тактические победы",
      social: "Ответственность перед людьми",
      creative: "Свободные творческие сессии"
    }
  }
};

type OnboardingAnswers = {
  bottleneck: string;
  commitment: string;
  energy: string;
  focus: string;
  nickname: string;
  note: string;
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

const inventoryCategoryLabels: Record<Language, Record<InventoryCategory, string>> = {
  en: {
    artifact: "Artifacts",
    contact: "Contacts",
    document: "Documents",
    idea: "Ideas",
    project: "Projects",
    purchase: "Purchases",
    resource: "Resources"
  },
  ru: {
    artifact: "Артефакты",
    contact: "Контакты",
    document: "Документы",
    idea: "Идеи",
    project: "Проекты",
    purchase: "Покупки",
    resource: "Ресурсы"
  }
};

const achievementLabels: Record<Language, Partial<Record<string, { description: string; title: string }>>> = {
  en: {},
  ru: {
    "first-check-in": { title: "Первый отчёт", description: "Сохрани первый ежедневный отчёт." },
    "first-inventory-item": { title: "Начало инвентаря", description: "Добавь первый предмет в инвентарь." },
    "first-note": { title: "Первая заметка", description: "Создай первую заметку в базе знаний." },
    "first-quest": { title: "Первый квест", description: "Заверши первый квест." },
    "first-wallet": { title: "Связь с активами", description: "Добавь первый отслеживаемый кошелёк." },
    "quest-starter": { title: "Начинающий искатель", description: "Заверши три квеста." }
  }
};

const progressKindLabels: Record<Language, Record<ProgressEvent["kind"], string>> = {
  en: {
    achievement_unlocked: "achievement unlocked",
    check_in: "daily check-in",
    inventory_item_created: "inventory item created",
    note_created: "note created",
    quest_completed: "quest completed",
    wallet_added: "wallet added"
  },
  ru: {
    achievement_unlocked: "открыто достижение",
    check_in: "ежедневный отчёт",
    inventory_item_created: "предмет добавлен",
    note_created: "заметка создана",
    quest_completed: "квест завершён",
    wallet_added: "кошелёк добавлен"
  }
};

function getLocale(language: Language): string {
  return language === "ru" ? "ru-RU" : "en-US";
}

function formatLocalDate(value: string, language: Language): string {
  return new Date(value).toLocaleDateString(getLocale(language));
}

function formatLocalDateTime(value: string, language: Language): string {
  return new Date(value).toLocaleString(getLocale(language));
}

function getProgressEventDetail(event: ProgressEvent, language: Language): string {
  if (event.kind !== "achievement_unlocked") {
    return event.detail;
  }

  const achievement = achievementCatalog.find((item) => item.title === event.title);
  return achievement ? achievementLabels[language][achievement.id]?.description ?? event.detail : event.detail;
}

const questScreenText = {
  en: {
    groups: "Quest Groups",
    groupName: "Group name",
    groupDescription: "Description",
    addGroup: "Create group",
    emptyGroups: "Create a group to start building your quest log.",
    questTitle: "Quest title",
    questNotes: "Notes",
    addQuest: "Add quest",
    noQuests: "No quests in this group yet.",
    completed: "Completed",
    delete: "Delete"
  },
  ru: {
    groups: "Группы квестов",
    groupName: "Название группы",
    groupDescription: "Описание",
    addGroup: "Создать группу",
    emptyGroups: "Создай группу, чтобы начать собирать журнал квестов.",
    questTitle: "Название квеста",
    questNotes: "Заметки",
    addQuest: "Добавить квест",
    noQuests: "В этой группе пока нет квестов.",
    completed: "Готово",
    delete: "Удалить"
  }
};

const knowledgeScreenText = {
  en: {
    notes: "Notes",
    newNote: "New note",
    title: "Title",
    body: "Body",
    save: "Save note",
    delete: "Delete",
    empty: "No notes yet. Create the first file for your second brain.",
    updated: "updated"
  },
  ru: {
    notes: "Заметки",
    newNote: "Новая заметка",
    title: "Заголовок",
    body: "Текст",
    save: "Сохранить заметку",
    delete: "Удалить",
    empty: "Заметок пока нет. Создай первый файл для второй головы.",
    updated: "обновлено"
  }
};

const extendedKnowledgeScreenText = {
  en: {
    notes: "Notes",
    newNote: "New note",
    title: "Title",
    body: "Body",
    kind: "Type",
    linkedItem: "Linked inventory item",
    noLinkedItem: "No linked item",
    tags: "Tags",
    tagsPlaceholder: "health, trading, routine",
    save: "Save note",
    delete: "Delete",
    empty: "No notes yet. Create the first file for your second brain.",
    updated: "updated",
    kinds: {
      decision: "Decision",
      link: "Link",
      note: "Note",
      reference: "Reference",
      rule: "Rule"
    }
  },
  ru: {
    notes: "Заметки",
    newNote: "Новая заметка",
    title: "Заголовок",
    body: "Текст",
    kind: "Тип",
    linkedItem: "Связанный предмет инвентаря",
    noLinkedItem: "Без связанного предмета",
    tags: "Теги",
    tagsPlaceholder: "здоровье, трейдинг, рутина",
    save: "Сохранить заметку",
    delete: "Удалить",
    empty: "Заметок пока нет. Создай первый файл для второй головы.",
    updated: "обновлено",
    kinds: {
      decision: "Решение",
      link: "Ссылка",
      note: "Заметка",
      reference: "Справка",
      rule: "Правило"
    }
  }
};

const inventoryScreenText = {
  en: {
    add: "Add item",
    all: "All",
    category: "Category",
    empty: "No inventory items yet. Add files, links, projects, and useful resources here.",
    items: "Items",
    link: "Link",
    linkPlaceholder: "https://, file path, or short reference",
    localItem: "local item",
    notes: "Notes",
    notesPlaceholder: "Why it matters, where it lives, what to do with it",
    title: "Title",
    titlePlaceholder: "Tax docs, trading checklist, course, tool...",
    value: "Value / priority",
    valuePlaceholder: "high, $49, urgent, later",
    remove: "Remove",
    updated: "updated"
  },
  ru: {
    add: "Добавить предмет",
    all: "Все",
    category: "Категория",
    empty: "Инвентарь пока пуст. Добавляй сюда файлы, ссылки, проекты и полезные ресурсы.",
    items: "Предметы",
    link: "Ссылка",
    linkPlaceholder: "https://, путь к файлу или короткая ссылка",
    localItem: "локальная запись",
    notes: "Заметки",
    notesPlaceholder: "Зачем это нужно, где находится и что с этим делать",
    title: "Название",
    titlePlaceholder: "Документы, чек-лист, курс, инструмент...",
    value: "Ценность / приоритет",
    valuePlaceholder: "высокий, $49, срочно, позже",
    remove: "Удалить",
    updated: "обновлено"
  }
};

const dashboardScreenText = {
  en: {
    assets: "Assets",
    dashboard: "System Dashboard",
    daily: "Daily",
    events: "Latest Events",
    inventory: "Inventory",
    knowledge: "Knowledge",
    nextActions: "Next Actions",
    noActions: "No open quests. Create a quest or write a check-in.",
    noEvents: "No progress events yet.",
    noNotes: "No notes yet.",
    notes: "notes",
    openQuests: "open quests",
    progress: "progress",
    streak: "day streak",
    totalBalance: "tracked value",
    items: "items",
    wallets: "wallets",
    xp: "XP"
  },
  ru: {
    assets: "Активы",
    dashboard: "Системный обзор",
    daily: "Сегодня",
    events: "Последние события",
    inventory: "Инвентарь",
    knowledge: "Знания",
    nextActions: "Следующие действия",
    noActions: "Открытых квестов нет. Создай квест или заполни ежедневный отчёт.",
    noEvents: "Событий прогресса пока нет.",
    noNotes: "Заметок пока нет.",
    notes: "заметок",
    openQuests: "открытых квестов",
    progress: "прогресс",
    streak: "дней подряд",
    totalBalance: "отслеживаемая сумма",
    items: "предметов",
    wallets: "кошельков",
    xp: "XP"
  }
};

const backupScreenText = {
  en: {
    export: "Export backup",
    import: "Import backup",
    meta: "local JSON",
    note: "Backups include wallet addresses and personal data. API keys and fetched balances are excluded.",
    statusExported: "Backup exported without API keys.",
    statusImported: "Backup imported. Local API keys were preserved.",
    statusInvalid: "This file is not a valid Self Improvement Labs backup.",
    title: "Privacy & Backup"
  },
  ru: {
    export: "Экспортировать резервную копию",
    import: "Импортировать резервную копию",
    meta: "локальный JSON",
    note: "В копию входят адреса кошельков и личные данные. API-ключи и загруженные балансы исключены.",
    statusExported: "Резервная копия экспортирована без API-ключей.",
    statusImported: "Резервная копия импортирована. Локальные API-ключи сохранены.",
    statusInvalid: "Файл не является корректной резервной копией Self Improvement Labs.",
    title: "Приватность и резервная копия"
  }
};

const progressScreenText = {
  en: {
    achievements: "Achievements",
    currentLevel: "Current level",
    dailyLogs: "daily logs",
    dayStreak: "day streak",
    emptyEvents: "No progress events yet. Complete a quest, add a note, or save a check-in.",
    eventLog: "Event Log",
    locked: "Locked",
    nextLevel: "next level",
    unlocked: "Unlocked",
    xpHistory: "XP history"
  },
  ru: {
    achievements: "Достижения",
    currentLevel: "Текущий уровень",
    dailyLogs: "дней в истории",
    dayStreak: "дней подряд",
    emptyEvents: "Событий пока нет. Заверши квест, добавь заметку или сохрани ежедневный отчёт.",
    eventLog: "Журнал событий",
    locked: "Закрыто",
    nextLevel: "до следующего уровня",
    unlocked: "Открыто",
    xpHistory: "история XP"
  }
};

const extendedQuestScreenText = {
  en: {
    ...questScreenText.en,
    boss: "Boss",
    difficulty: "Difficulty",
    dueDate: "Due date",
    easy: "Easy",
    hard: "Hard",
    normal: "Normal",
    rewardXp: "Reward XP",
    statPoints: "Stat points",
    statReward: "Skill reward",
    noStatReward: "No skill"
  },
  ru: {
    ...questScreenText.ru,
    boss: "Босс",
    difficulty: "Сложность",
    dueDate: "Срок",
    easy: "Легко",
    hard: "Сложно",
    normal: "Обычно",
    rewardXp: "Награда XP",
    statPoints: "Очки навыка",
    statReward: "Награда навыка",
    noStatReward: "Без навыка"
  }
};

const todayScreenText = {
  en: {
    checkIn: "Daily Check-In",
    checkedIn: "checked in",
    complete: "Complete",
    earnedToday: "XP earned today",
    energy: "Energy",
    energyOptions: {
      high: "High",
      low: "Low",
      steady: "Steady"
    },
    focus: "Main focus",
    focusPlaceholder: "The one thing that makes today count",
    noQuests: "No open quests yet. Create one in Quests.",
    openQuests: "Open Quests",
    reflection: "End-of-day note",
    reflectionPlaceholder: "What happened, what changed, what to adjust",
    save: "Save check-in",
    streakSeed: "Daily loop",
    todayPlan: "Today's Plan",
    xpPerQuest: "Quest rewards are shown on each card"
  },
  ru: {
    checkIn: "Ежедневный отчёт",
    checkedIn: "отчёт сохранён",
    complete: "Закрыть",
    earnedToday: "XP за сегодня",
    energy: "Энергия",
    energyOptions: {
      high: "Высокая",
      low: "Низкая",
      steady: "Ровная"
    },
    focus: "Главный фокус",
    focusPlaceholder: "Одна вещь, которая сделает день не зря",
    noQuests: "Открытых квестов пока нет. Создай квест во вкладке «Квесты».",
    openQuests: "Открытые квесты",
    reflection: "Заметка конца дня",
    reflectionPlaceholder: "Что произошло, что изменилось, что поправить",
    save: "Сохранить отчёт",
    streakSeed: "Ежедневный цикл",
    todayPlan: "План на сегодня",
    xpPerQuest: "Награда указана на каждой карточке"
  }
};

const extendedTodayScreenText = {
  en: {
    ...todayScreenText.en,
    history: "Daily History",
    historyEmpty: "No saved days yet.",
    streak: "streak"
  },
  ru: {
    ...todayScreenText.ru,
    history: "История дней",
    historyEmpty: "Сохранённых дней пока нет.",
    streak: "дней подряд"
  }
};

function createDefaultQuestGroups(): QuestGroup[] {
  return [{
    id: "daily",
    title: "Daily",
    description: "Small repeatable quests for the current day.",
    quests: [],
    createdAt: new Date().toISOString()
  }];
}

function getTodayKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

function createDefaultDailyState(date = getTodayKey()): DailyState {
  return {
    date,
    energy: "steady",
    focus: "",
    reflection: "",
    completedQuestIds: [],
    xpEarned: 0
  };
}

function normalizeDailyState(state?: Partial<DailyState> | null): DailyState {
  const today = getTodayKey();

  if (!state || state.date !== today) {
    return createDefaultDailyState(today);
  }

  return {
    ...createDefaultDailyState(today),
    ...state,
    completedQuestIds: state.completedQuestIds ?? []
  };
}

function dailyStateHasActivity(state: DailyState): boolean {
  return Boolean(state.checkInAt || state.focus || state.reflection || state.completedQuestIds.length > 0 || state.xpEarned > 0);
}

function dailyStateToLog(state: DailyState): DailyLog {
  return {
    ...state,
    updatedAt: new Date().toISOString()
  };
}

function upsertDailyLog(history: DailyLog[], state: DailyState): DailyLog[] {
  if (!dailyStateHasActivity(state)) {
    return history;
  }

  const log = dailyStateToLog(state);
  const nextHistory = [
    log,
    ...history.filter((item) => item.date !== state.date)
  ];

  return nextHistory
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 120);
}

function calculateDailyStreak(history: DailyLog[], todayState: DailyState): number {
  const activeDates = new Set(history.filter(dailyStateHasActivity).map((item) => item.date));

  if (dailyStateHasActivity(todayState)) {
    activeDates.add(todayState.date);
  }

  let streak = 0;
  const cursor = new Date(`${getTodayKey()}T00:00:00`);

  while (activeDates.has(cursor.toLocaleDateString("en-CA"))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function isBackupDocument(value: unknown): value is BackupDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const backup = value as Partial<BackupDocument>;
  const state = backup.state as Partial<BackupState> | undefined;

  return backup.app === "self-improvement-labs"
    && backup.version === 1
    && Boolean(state)
    && Boolean(state?.profile && typeof state.profile === "object")
    && Array.isArray(state?.questGroups)
    && Array.isArray(state?.wallets)
    && Array.isArray(state?.knowledgeNotes)
    && Array.isArray(state?.inventoryItems);
}

const knowledgeKinds: KnowledgeNoteKind[] = ["note", "rule", "decision", "link", "reference"];
const questDifficulties: QuestDifficulty[] = ["easy", "normal", "hard", "boss"];

const questDefaultXpByDifficulty: Record<QuestDifficulty, number> = {
  boss: 50,
  easy: 5,
  hard: 25,
  normal: 10
};

const questDefaultStatPointsByDifficulty: Record<QuestDifficulty, number> = {
  boss: 3,
  easy: 0,
  hard: 2,
  normal: 1
};

function normalizeKnowledgeNote(note: KnowledgeNote): KnowledgeNote {
  return {
    ...note,
    kind: note.kind ?? "note",
    tags: note.tags ?? [],
    linkedInventoryItemId: note.linkedInventoryItemId ?? ""
  };
}

function normalizeQuest(quest: Quest): Quest {
  const difficulty = quest.difficulty ?? "normal";

  return {
    ...quest,
    difficulty,
    dueDate: quest.dueDate ?? "",
    rewardXp: quest.rewardXp ?? questDefaultXpByDifficulty[difficulty],
    statPoints: quest.statPoints ?? questDefaultStatPointsByDifficulty[difficulty],
    statReward: quest.statReward ?? ""
  };
}

function normalizeQuestGroups(groups: QuestGroup[]): QuestGroup[] {
  return groups.map((group) => ({
    ...group,
    quests: group.quests.map(normalizeQuest)
  }));
}

function normalizeAchievements(achievements?: PlayerAchievement[]): PlayerAchievement[] {
  return achievementCatalog.map((achievement) => {
    const saved = achievements?.find((item) => item.id === achievement.id);
    return saved ? { ...achievement, unlockedAt: saved.unlockedAt } : achievement;
  });
}

function applyXp(profile: PlayerProfile, xp: number): PlayerProfile {
  if (xp <= 0) {
    return profile;
  }

  let level = profile.level;
  let currentXp = profile.xp + xp;
  let xpToNextLevel = profile.xpToNextLevel;

  while (currentXp >= xpToNextLevel) {
    currentXp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = Math.round(xpToNextLevel * 1.18 + 20);
  }

  return {
    ...profile,
    level,
    xp: currentXp,
    xpToNextLevel
  };
}

function buildProfileFromOnboarding(answers: OnboardingAnswers): PlayerProfile {
  const focusMap: Record<string, { archetype: string; className: string; focusArea: string; statBoosts: Partial<Record<string, number>> }> = {
    body: { archetype: "Vitalist", className: "Body Operator", focusArea: "Body and energy", statBoosts: { Body: 3, Discipline: 1 } },
    craft: { archetype: "Builder", className: "Craft Specialist", focusArea: "Skill and career", statBoosts: { Focus: 2, Creative: 1, Discipline: 1 } },
    money: { archetype: "Strategist", className: "Asset Operator", focusArea: "Money and assets", statBoosts: { Focus: 1, Will: 1, Discipline: 2 } },
    mind: { archetype: "Archivist", className: "Knowledge Keeper", focusArea: "Knowledge and clarity", statBoosts: { Focus: 2, Creative: 2 } },
    order: { archetype: "Executor", className: "System Architect", focusArea: "Routine and discipline", statBoosts: { Discipline: 3, Will: 1 } }
  };

  const bottleneckMap: Record<string, { weakSpot: string; statPenalty: string }> = {
    avoidance: { weakSpot: "Resistance to hard starts", statPenalty: "Will" },
    chaos: { weakSpot: "Unsorted priorities", statPenalty: "Discipline" },
    distraction: { weakSpot: "Attention leaks", statPenalty: "Focus" },
    doubt: { weakSpot: "Decision friction", statPenalty: "Creative" },
    fatigue: { weakSpot: "Low recovery buffer", statPenalty: "Body" }
  };

  const energyMap: Record<string, string> = {
    creative: "creative bursts",
    social: "external accountability",
    solo: "solo deep work",
    tactical: "small tactical wins"
  };

  const focus = focusMap[answers.focus] ?? focusMap.order;
  const bottleneck = bottleneckMap[answers.bottleneck] ?? bottleneckMap.chaos;
  const stats = playerStats.map((stat) => {
    const boosted = stat.value + (focus.statBoosts[stat.label] ?? 1);
    const value = stat.label === bottleneck.statPenalty ? Math.max(0, boosted - 1) : boosted;
    return { ...stat, value };
  });

  return {
    ...defaultProfile,
    archetype: focus.archetype,
    className: focus.className,
    focusArea: focus.focusArea,
    motivationStyle: energyMap[answers.energy] ?? "small tactical wins",
    nickname: answers.nickname.trim() || defaultProfile.nickname,
    onboardingCompletedAt: new Date().toISOString(),
    originNote: answers.note.trim(),
    stats,
    weakSpot: bottleneck.weakSpot
  };
}

function buildStarterQuestGroup(answers: OnboardingAnswers, language: Language): QuestGroup {
  const now = new Date().toISOString();
  const title = language === "ru" ? "Стартовая арка" : "Starter Arc";
  const description = language === "ru"
    ? "Первые квесты, созданные после регистрации."
    : "First quests generated after registration.";
  const commitment = answers.commitment.trim() || (language === "ru" ? "10 минут" : "10 minutes");
  const focusTitle = onboardingText[language].focusOptions[answers.focus as keyof typeof onboardingText.en.focusOptions] ?? answers.focus;
  const bottleneckTitle = onboardingText[language].bottleneckOptions[answers.bottleneck as keyof typeof onboardingText.en.bottleneckOptions] ?? answers.bottleneck;

  const questTemplates = language === "ru"
    ? [
      { title: `Ежедневный минимум: ${commitment}`, notes: "Минимальное действие, которое поддерживает streak даже в плохой день." },
      { title: `Навести порядок в арке: ${focusTitle}`, notes: "Запиши одну конкретную цель на ближайшие 7 дней." },
      { title: `Контрмера: ${bottleneckTitle}`, notes: "Опиши один простой способ заранее обойти слабое место." }
    ]
    : [
      { title: `Daily minimum: ${commitment}`, notes: "The smallest action that keeps the streak alive even on a bad day." },
      { title: `Clarify the arc: ${focusTitle}`, notes: "Write one concrete target for the next 7 days." },
      { title: `Countermeasure: ${bottleneckTitle}`, notes: "Define one simple way to route around the weak spot." }
    ];

  return {
    id: createEntityId("quest-group"),
    title,
    description,
    createdAt: now,
    quests: questTemplates.map((quest) => ({
      id: createEntityId("quest"),
      completed: false,
      createdAt: now,
      ...quest
    }))
  };
}

export function SystemShell() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("milk");
  const [achievements, setAchievements] = useState<PlayerAchievement[]>(normalizeAchievements());
  const [dailyHistory, setDailyHistory] = useState<DailyLog[]>([]);
  const [dailyState, setDailyState] = useState<DailyState>(createDefaultDailyState);
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [providers, setProviders] = useState<ProviderConfig>(defaultProviderConfig);
  const [questGroups, setQuestGroups] = useState<QuestGroup[]>(createDefaultQuestGroups);
  const [knowledgeNotes, setKnowledgeNotes] = useState<KnowledgeNote[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([]);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [threshold, setThreshold] = useState(1);
  const [message, setMessage] = useState("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [balanceErrors, setBalanceErrors] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const text = t[language];

  const visibleBalances = useMemo(
    () => balances
      .filter((balance) => {
        if (balance.isPriced === false) {
          return !providers.hideUnpricedTokens;
        }

        return balance.usdValue >= threshold;
      })
      .sort((a, b) => b.usdValue - a.usdValue),
    [balances, providers.hideUnpricedTokens, threshold]
  );
  const totals = useMemo(() => getPortfolioTotals(balances), [balances]);
  const dailyStreak = useMemo(() => calculateDailyStreak(dailyHistory, dailyState), [dailyHistory, dailyState]);

  useEffect(() => {
    let active = true;

    readLocalState()
      .then((state) => {
        if (!active || !state) return;
        setAchievements(normalizeAchievements(state.achievements));
        const savedHistory = state.dailyHistory ?? [];
        if (state.dailyState) {
          setDailyHistory(state.dailyState.date === getTodayKey()
            ? savedHistory
            : upsertDailyLog(savedHistory, { ...createDefaultDailyState(state.dailyState.date), ...state.dailyState })
          );
          setDailyState(normalizeDailyState(state.dailyState));
        } else {
          setDailyHistory(savedHistory);
        }
        if (state.language) setLanguage(state.language);
        if (state.theme) setTheme(state.theme);
        if (state.profile) setProfile({ ...defaultProfile, ...state.profile });
        if (state.providers) setProviders({ ...defaultProviderConfig, ...state.providers });
        if (state.questGroups) setQuestGroups(normalizeQuestGroups(state.questGroups));
        if (state.inventoryItems) setInventoryItems(state.inventoryItems);
        if (state.knowledgeNotes) setKnowledgeNotes(state.knowledgeNotes.map(normalizeKnowledgeNote));
        if (state.progressEvents) setProgressEvents(state.progressEvents);
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
    const timeoutId = globalThis.setTimeout(() => setShowSplash(false), 1500);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void writeLocalState({
      achievements,
      dailyHistory,
      dailyState,
      inventoryItems,
      knowledgeNotes,
      language,
      profile,
      progressEvents,
      providers,
      questGroups,
      theme,
      wallets
    });
  }, [achievements, dailyHistory, dailyState, inventoryItems, isHydrated, knowledgeNotes, language, profile, progressEvents, providers, questGroups, theme, wallets]);

  useEffect(() => {
    setThreshold(providers.minUsdValue);
  }, [providers.minUsdValue]);

  function navigate(section: Section) {
    setActiveSection(section);
  }

  function recordProgress({
    achievementId,
    detail,
    kind,
    title,
    xp
  }: Omit<ProgressEvent, "createdAt" | "id"> & { achievementId?: string }) {
    const now = new Date().toISOString();

    setProgressEvents((current) => [{
      id: createEntityId("progress"),
      createdAt: now,
      detail,
      kind,
      title,
      xp
    }, ...current].slice(0, 80));

    if (xp > 0) {
      setProfile((current) => applyXp(current, xp));
    }

    if (!achievementId) {
      return;
    }

    const achievement = achievements.find((item) => item.id === achievementId);
    if (!achievement || achievement.unlockedAt) {
      return;
    }

    setProgressEvents((events) => [{
        id: createEntityId("progress"),
        createdAt: now,
        detail: achievement.description,
        kind: "achievement_unlocked" as const,
        title: achievement.title,
        xp: 0
      }, ...events].slice(0, 80));

    setAchievements((current) => current.map((item) => item.id === achievementId ? { ...item, unlockedAt: now } : item));
  }

  function completeOnboarding(answers: OnboardingAnswers) {
    const generatedProfile = buildProfileFromOnboarding(answers);
    const starterGroup = buildStarterQuestGroup(answers, language);

    setProfile(generatedProfile);
    setQuestGroups([starterGroup, ...questGroups.filter((group) => group.id !== "daily")]);
    setActiveSection("dashboard");
  }

  function saveDailyCheckIn(update: Pick<DailyState, "energy" | "focus" | "reflection">) {
    const currentDailyState = normalizeDailyState(dailyState);
    const isFirstCheckInToday = !currentDailyState.checkInAt;
    const nextDailyState = {
      ...currentDailyState,
      ...update,
      checkInAt: new Date().toISOString()
    };

    setDailyState(nextDailyState);
    setDailyHistory((current) => upsertDailyLog(current, nextDailyState));

    if (isFirstCheckInToday) {
      recordProgress({
        achievementId: "first-check-in",
        detail: update.focus || "Daily check-in saved.",
        kind: "check_in",
        title: "Daily check-in",
        xp: 5
      });
    }
  }

  function completeQuest(groupId: string, questId: string, source: "daily" | "quest-log" = "quest-log") {
    const targetGroup = questGroups.find((group) => group.id === groupId);
    const targetQuest = targetGroup?.quests.find((quest) => quest.id === questId);

    if (!targetQuest || targetQuest.completed) {
      return;
    }

    const quest = normalizeQuest(targetQuest);
    const rewardXp = quest.rewardXp ?? questDefaultXpByDifficulty[quest.difficulty ?? "normal"];
    const statPoints = quest.statReward ? (quest.statPoints ?? 0) : 0;
    const completedAt = new Date().toISOString();
    setQuestGroups((current) => current.map((group) => group.id === groupId
      ? {
        ...group,
        quests: group.quests.map((quest) => quest.id === questId
          ? { ...quest, completed: true, completedAt }
          : quest
        )
      }
      : group
    ));

    if (source === "daily") {
      const normalizedDailyState = normalizeDailyState(dailyState);
      const nextDailyState = {
        ...normalizedDailyState,
        completedQuestIds: [...normalizedDailyState.completedQuestIds.filter((id) => id !== questId), questId],
        xpEarned: normalizedDailyState.xpEarned + rewardXp
      };

      setDailyState(nextDailyState);
      setDailyHistory((current) => upsertDailyLog(current, nextDailyState));
    }

    const completedCount = questGroups.reduce(
      (total, group) => total + group.quests.filter((quest) => quest.completed || quest.id === questId).length,
      0
    );
    recordProgress({
      achievementId: completedCount >= 3 ? "quest-starter" : "first-quest",
      detail: statPoints > 0 ? `${quest.title} / +${statPoints} ${quest.statReward}` : quest.title,
      kind: "quest_completed",
      title: "Quest completed",
      xp: rewardXp
    });

    if (quest.statReward && statPoints > 0) {
      setProfile((current) => ({
        ...current,
        stats: current.stats.map((stat) => stat.label === quest.statReward
          ? { ...stat, value: stat.value + statPoints }
          : stat
        )
      }));
    }
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
    if (wallets.length === 0) {
      recordProgress({
        achievementId: "first-wallet",
        detail: label || `${chain.toUpperCase()} wallet`,
        kind: "wallet_added",
        title: "Wallet added",
        xp: 0
      });
    }
    setMessage(text.wallets.added);
    event.currentTarget.reset();
  }

  async function refreshWalletBalances() {
    setIsRefreshing(true);
    setMessage("");
    setBalanceErrors([]);

    try {
      const result = await refreshBalances(wallets, providers);
      setBalances(result.balances);
      setBalanceErrors(result.errors);
      setUpdatedAt(result.updatedAt);
    } catch (error) {
      setBalanceErrors([error instanceof Error ? error.message : String(error)]);
    } finally {
      setIsRefreshing(false);
    }
  }

  function exportBackup() {
    const backup: BackupDocument = {
      app: "self-improvement-labs",
      exportedAt: new Date().toISOString(),
      state: {
        achievements,
        dailyHistory,
        dailyState,
        inventoryItems,
        knowledgeNotes,
        language,
        profile,
        progressEvents,
        providers: {
          enabledEvmNetworks: providers.enabledEvmNetworks,
          hideUnpricedTokens: providers.hideUnpricedTokens,
          minUsdValue: providers.minUsdValue
        },
        questGroups,
        theme,
        wallets
      },
      version: 1
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `self-improvement-labs-backup-${getTodayKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file: File): Promise<boolean> {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isBackupDocument(parsed)) {
        return false;
      }

      const imported = parsed.state;
      setAchievements(normalizeAchievements(imported.achievements));
      setDailyHistory(imported.dailyHistory ?? []);
      setDailyState(normalizeDailyState(imported.dailyState));
      setInventoryItems(imported.inventoryItems ?? []);
      setKnowledgeNotes((imported.knowledgeNotes ?? []).map(normalizeKnowledgeNote));
      setLanguage(imported.language ?? "en");
      setProfile({ ...defaultProfile, ...imported.profile });
      setProgressEvents(imported.progressEvents ?? []);
      setProviders((current) => ({
        ...defaultProviderConfig,
        ...imported.providers,
        alchemyApiKey: current.alchemyApiKey,
        heliusApiKey: current.heliusApiKey
      }));
      setQuestGroups(normalizeQuestGroups(imported.questGroups ?? []));
      setTheme(imported.theme ?? "milk");
      setWallets(imported.wallets ?? []);
      setBalances([]);
      setBalanceErrors([]);
      setUpdatedAt("");
      setActiveSection("dashboard");
      return true;
    } catch {
      return false;
    }
  }

  const [title, subtitle] = text.sections[activeSection];

  if (showSplash || !isHydrated) {
    return (
      <div className="fullscreen-shell" data-theme={theme}>
        <SplashScreen />
      </div>
    );
  }

  if (!profile.onboardingCompletedAt) {
    return (
      <div className="fullscreen-shell" data-theme={theme}>
        <OnboardingScreen
          language={language}
          onComplete={completeOnboarding}
        />
      </div>
    );
  }

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

        {activeSection === "dashboard" && (
          <DashboardScreen
            dailyState={dailyState}
            dailyStreak={dailyStreak}
            inventoryItems={inventoryItems}
            knowledgeNotes={knowledgeNotes}
            language={language}
            onNavigate={navigate}
            profile={profile}
            progressEvents={progressEvents}
            questGroups={questGroups}
            totals={totals}
            walletCount={wallets.length}
          />
        )}

        {activeSection === "today" && (
          <TodayScreen
            dailyHistory={dailyHistory}
            dailyState={dailyState}
            dailyStreak={dailyStreak}
            language={language}
            onCompleteQuest={(groupId, questId) => completeQuest(groupId, questId, "daily")}
            onSaveCheckIn={saveDailyCheckIn}
            profile={profile}
            questGroups={questGroups}
          />
        )}

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

        {activeSection === "progress" && (
          <ProgressScreen
            achievements={achievements}
            dailyHistory={dailyHistory}
            dailyStreak={dailyStreak}
            language={language}
            profile={profile}
            progressEvents={progressEvents}
          />
        )}

        {activeSection === "wallets" && (
          <WalletsScreen
            addWallet={addWallet}
            message={message}
            removeWallet={(id) => setWallets((current) => current.filter((wallet) => wallet.id !== id))}
            balanceErrors={balanceErrors}
            isRefreshing={isRefreshing}
            language={language}
            refreshBalances={refreshWalletBalances}
            setThreshold={(value) => {
              setThreshold(value);
              setProviders({ ...providers, minUsdValue: value });
            }}
            hideUnpricedTokens={providers.hideUnpricedTokens}
            setHideUnpricedTokens={(value) => setProviders({ ...providers, hideUnpricedTokens: value })}
            text={text.wallets}
            threshold={threshold}
            updatedAt={updatedAt}
            visibleBalances={visibleBalances}
            wallets={wallets}
          />
        )}

        {activeSection === "inventory" && (
          <InventoryScreen
            inventoryItems={inventoryItems}
            language={language}
            onItemCreated={(item) => recordProgress({
              achievementId: "first-inventory-item",
              detail: item.title,
              kind: "inventory_item_created",
              title: "Inventory item created",
              xp: 3
            })}
            setInventoryItems={setInventoryItems}
          />
        )}
        {activeSection === "quests" && (
          <QuestsScreen
            language={language}
            onCompleteQuest={(groupId, questId) => completeQuest(groupId, questId, "quest-log")}
            questGroups={questGroups}
            setQuestGroups={setQuestGroups}
          />
        )}
        {activeSection === "skills" && <SkillsScreen language={language} stats={profile.stats} />}
        {activeSection === "knowledge" && (
          <KnowledgeScreen
            inventoryItems={inventoryItems}
            knowledgeNotes={knowledgeNotes}
            language={language}
            onNoteCreated={(note) => recordProgress({
              achievementId: "first-note",
              detail: note.title,
              kind: "note_created",
              title: "Knowledge note created",
              xp: 3
            })}
            setKnowledgeNotes={setKnowledgeNotes}
          />
        )}
        {activeSection === "settings" && (
          <SettingsScreen
            exportBackup={exportBackup}
            importBackup={importBackup}
            language={language}
            providers={providers}
            setProviders={setProviders}
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

function SplashScreen() {
  useEffect(() => {
    const AudioContextCtor = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const startedAt = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, startedAt);
    master.gain.exponentialRampToValueAtTime(0.035, startedAt + 0.08);
    master.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.85);
    master.connect(context.destination);

    [261.63, 329.63, 392].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      const noteStart = startedAt + index * 0.08;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.45, noteStart + 0.06);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.72);
      oscillator.connect(noteGain);
      noteGain.connect(master);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.8);
    });

    const closeTimeout = globalThis.setTimeout(() => {
      void context.close().catch(() => undefined);
    }, 1200);

    return () => {
      globalThis.clearTimeout(closeTimeout);
      void context.close().catch(() => undefined);
    };
  }, []);

  return (
    <main className="splash-screen" aria-label="Self Improvement Labs loading">
      <div className="splash-mark">
        <span>SYSTEM</span>
      </div>
      <h1>Self Improvement Labs</h1>
      <div className="splash-line" />
    </main>
  );
}

function OnboardingScreen({
  language,
  onComplete
}: {
  language: Language;
  onComplete: (answers: OnboardingAnswers) => void;
}) {
  const text = onboardingText[language];

  function submitOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    onComplete({
      bottleneck: String(form.get("bottleneck") || "chaos"),
      commitment: String(form.get("commitment") || "").trim(),
      energy: String(form.get("energy") || "tactical"),
      focus: String(form.get("focus") || "order"),
      nickname: String(form.get("nickname") || "").trim(),
      note: String(form.get("note") || "").trim()
    });
  }

  return (
    <main className="onboarding-shell">
      <section className="onboarding-card">
        <div className="onboarding-copy">
          <p className="kicker">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>

        <form className="onboarding-form" onSubmit={submitOnboarding}>
          <label>
            <span>{text.nickname}</span>
            <input autoFocus name="nickname" placeholder="morph" />
          </label>

          <label>
            <span>{text.focus}</span>
            <select name="focus" defaultValue="order">
              {Object.entries(text.focusOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{text.bottleneck}</span>
            <select name="bottleneck" defaultValue="chaos">
              {Object.entries(text.bottleneckOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{text.energy}</span>
            <select name="energy" defaultValue="tactical">
              {Object.entries(text.energyOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{text.commitment}</span>
            <input name="commitment" placeholder={language === "ru" ? "20 минут в день" : "20 minutes a day"} />
          </label>

          <label>
            <span>{text.note}</span>
            <textarea name="note" placeholder={language === "ru" ? "Например: хочу меньше хаоса и больше фокуса." : "Example: less chaos, more focus."} />
          </label>

          <button className="primary-button" type="submit">{text.start}</button>
        </form>
      </section>
    </main>
  );
}

function DashboardScreen({
  dailyState,
  dailyStreak,
  inventoryItems,
  knowledgeNotes,
  language,
  onNavigate,
  profile,
  progressEvents,
  questGroups,
  totals,
  walletCount
}: {
  dailyState: DailyState;
  dailyStreak: number;
  inventoryItems: InventoryItem[];
  knowledgeNotes: KnowledgeNote[];
  language: Language;
  onNavigate: (section: Section) => void;
  profile: PlayerProfile;
  progressEvents: ProgressEvent[];
  questGroups: QuestGroup[];
  totals: { total: number; evm: number; solana: number };
  walletCount: number;
}) {
  const text = dashboardScreenText[language];
  const openQuests = questGroups
    .flatMap((group) => group.quests.map((quest) => ({ ...normalizeQuest(quest), groupId: group.id, groupTitle: group.title })))
    .filter((quest) => !quest.completed)
    .slice(0, 5);
  const xpPercent = Math.min(100, Math.max(0, (profile.xp / profile.xpToNextLevel) * 100));
  const latestNotes = knowledgeNotes.slice(0, 3);

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero">
        <div>
          <p className="kicker">{text.dashboard}</p>
          <h2>{profile.nickname}</h2>
          <p>{profile.className} / {profile.focusArea}</p>
        </div>
        <div className="dashboard-level">
          <span>LV {profile.level.toString().padStart(2, "0")}</span>
          <strong>{profile.xp}/{profile.xpToNextLevel} {text.xp}</strong>
          <div className="xp-track">
            <div style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="dashboard-metrics" aria-label="System metrics">
        <button type="button" onClick={() => onNavigate("today")}>
          <span>{text.daily}</span>
          <strong>{dailyStreak}</strong>
          <small>{text.streak}</small>
        </button>
        <button type="button" onClick={() => onNavigate("quests")}>
          <span>Quests</span>
          <strong>{openQuests.length}</strong>
          <small>{text.openQuests}</small>
        </button>
        <button type="button" onClick={() => onNavigate("wallets")}>
          <span>{text.assets}</span>
          <strong>{formatUsd(totals.total)}</strong>
          <small>{walletCount} {text.wallets}</small>
        </button>
        <button type="button" onClick={() => onNavigate("knowledge")}>
          <span>{text.knowledge}</span>
          <strong>{knowledgeNotes.length}</strong>
          <small>{text.notes}</small>
        </button>
        <button type="button" onClick={() => onNavigate("inventory")}>
          <span>{text.inventory}</span>
          <strong>{inventoryItems.length}</strong>
          <small>{text.items}</small>
        </button>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelTitle title={text.nextActions} meta={dailyState.focus || profile.focusArea} />
          <div className="dashboard-action-list">
            {openQuests.length === 0 && <p className="muted">{text.noActions}</p>}
            {openQuests.map((quest) => (
              <button key={quest.id} type="button" onClick={() => onNavigate("quests")}>
                <div>
                  <span>{quest.groupTitle}</span>
                  <strong>{quest.title}</strong>
                </div>
                <small>+{quest.rewardXp ?? 0} XP</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelTitle title={text.events} meta={text.progress} />
          <div className="dashboard-event-list">
            {progressEvents.length === 0 && <p className="muted">{text.noEvents}</p>}
            {progressEvents.slice(0, 5).map((event) => (
              <article key={event.id}>
                <strong>{progressKindLabels[language][event.kind]}</strong>
                <span>{formatLocalDateTime(event.createdAt, language)} {event.xp > 0 ? `/ +${event.xp} XP` : ""}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel dashboard-knowledge-panel">
          <PanelTitle title={text.knowledge} meta={`${knowledgeNotes.length}`} />
          <div className="dashboard-note-list">
            {latestNotes.length === 0 && <p className="muted">{text.noNotes}</p>}
            {latestNotes.map((note) => (
              <button key={note.id} type="button" onClick={() => onNavigate("knowledge")}>
                <strong>{note.title}</strong>
                <span>{formatLocalDate(note.updatedAt, language)}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TodayScreen({
  dailyHistory,
  dailyState,
  dailyStreak,
  language,
  onCompleteQuest,
  onSaveCheckIn,
  profile,
  questGroups
}: {
  dailyHistory: DailyLog[];
  dailyState: DailyState;
  dailyStreak: number;
  language: Language;
  onCompleteQuest: (groupId: string, questId: string) => void;
  onSaveCheckIn: (update: Pick<DailyState, "energy" | "focus" | "reflection">) => void;
  profile: PlayerProfile;
  questGroups: QuestGroup[];
}) {
  const text = extendedTodayScreenText[language];
  const openQuests = questGroups
    .flatMap((group) => group.quests.map((quest) => ({ ...normalizeQuest(quest), groupId: group.id, groupTitle: group.title })))
    .filter((quest) => !quest.completed)
    .slice(0, 6);
  const xpPercent = Math.min(100, Math.max(0, (profile.xp / profile.xpToNextLevel) * 100));

  function submitCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    onSaveCheckIn({
      energy: String(form.get("energy") || "steady") as DailyEnergy,
      focus: String(form.get("focus") || "").trim(),
      reflection: String(form.get("reflection") || "").trim()
    });
  }

  return (
    <div className="today-layout">
      <section className="today-hero">
        <div>
          <p className="kicker">{text.streakSeed}</p>
          <h2>{text.todayPlan}</h2>
          <p>{dailyState.focus || profile.focusArea}</p>
        </div>
        <div className="today-xp">
          <span>{text.earnedToday}</span>
          <strong>{dailyState.xpEarned}</strong>
          <small>{profile.xp}/{profile.xpToNextLevel} XP</small>
          <small>{dailyStreak} {text.streak}</small>
          <div className="xp-track">
            <div style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </section>

      <div className="today-grid">
        <section className="panel">
          <PanelTitle title={text.checkIn} meta={dailyState.checkInAt ? text.checkedIn : dailyState.date} />
          <form className="daily-form" onSubmit={submitCheckIn}>
            <label>
              <span>{text.energy}</span>
              <select name="energy" defaultValue={dailyState.energy}>
                <option value="low">{text.energyOptions.low}</option>
                <option value="steady">{text.energyOptions.steady}</option>
                <option value="high">{text.energyOptions.high}</option>
              </select>
            </label>
            <label>
              <span>{text.focus}</span>
              <input name="focus" defaultValue={dailyState.focus} placeholder={text.focusPlaceholder} />
            </label>
            <label>
              <span>{text.reflection}</span>
              <textarea name="reflection" defaultValue={dailyState.reflection} placeholder={text.reflectionPlaceholder} />
            </label>
            <button className="primary-button" type="submit">{text.save}</button>
          </form>
        </section>

        <section className="panel">
          <PanelTitle title={text.openQuests} meta={text.xpPerQuest} />
          <div className="daily-quest-list">
            {openQuests.length === 0 && <p className="muted">{text.noQuests}</p>}
            {openQuests.map((quest) => (
              <div className="daily-quest-card" key={quest.id}>
                <div>
                  <span>{quest.groupTitle}</span>
                  <strong>{quest.title}</strong>
                  <small>+{quest.rewardXp ?? 0} XP</small>
                  {quest.statReward && <small>+{quest.statPoints ?? 0} {statLabels[language][quest.statReward] ?? quest.statReward}</small>}
                  {quest.notes && <p>{quest.notes}</p>}
                </div>
                <button type="button" onClick={() => onCompleteQuest(quest.groupId, quest.id)}>
                  {text.complete}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel daily-history-panel">
        <PanelTitle title={text.history} meta={`${dailyStreak} ${text.streak}`} />
        <div className="daily-history-list">
          {dailyHistory.length === 0 && !dailyStateHasActivity(dailyState) && <p className="muted">{text.historyEmpty}</p>}
          {[dailyStateToLog(dailyState), ...dailyHistory.filter((item) => item.date !== dailyState.date)]
              .filter(dailyStateHasActivity)
              .slice(0, 7)
              .map((log) => (
              <article className="daily-history-card" key={log.date}>
                <strong>{formatLocalDate(`${log.date}T12:00:00`, language)}</strong>
                <span>{text.energyOptions[log.energy]} / +{log.xpEarned} XP / {log.completedQuestIds.length}</span>
                {log.focus && <p>{log.focus}</p>}
              </article>
            ))}
        </div>
      </section>
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
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [draftNickname, setDraftNickname] = useState(profile.nickname);

  useEffect(() => {
    if (!isEditingNickname) {
      setDraftNickname(profile.nickname);
    }
  }, [isEditingNickname, profile.nickname]);

  function commitNickname() {
    const nickname = draftNickname.trim() || defaultProfile.nickname;
    setProfile({ ...profile, nickname });
    setDraftNickname(nickname);
    setIsEditingNickname(false);
  }

  return (
    <div className="screen-stack">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="kicker">{text.kicker}</p>
          {isEditingNickname ? (
            <input
              aria-label={text.nickname}
              autoFocus
              className="nickname-inline-input"
              onBlur={commitNickname}
              onChange={(event) => setDraftNickname(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitNickname();
                }
                if (event.key === "Escape") {
                  setDraftNickname(profile.nickname);
                  setIsEditingNickname(false);
                }
              }}
              value={draftNickname}
            />
          ) : (
            <h2
              className="nickname-heading"
              onDoubleClick={() => setIsEditingNickname(true)}
              tabIndex={0}
              title="Double-click to edit"
            >
              {profile.nickname}
            </h2>
          )}
          <p>{text.description}</p>
          <div className="identity-grid">
            <div><span>{text.className}</span><strong>{profile.className}</strong></div>
            <div><span>{text.archetype}</span><strong>{profile.archetype}</strong></div>
            <div><span>{text.focusArea}</span><strong>{profile.focusArea}</strong></div>
            <div><span>{text.weakSpot}</span><strong>{profile.weakSpot}</strong></div>
            <div><span>{text.motivationStyle}</span><strong>{profile.motivationStyle}</strong></div>
          </div>
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
        <AvatarPreview
          classLine={profile.className || text.classLine}
          level={profile.level}
          nickname={profile.nickname}
        />
      </section>

      <div className="grid two">
        <section className="panel">
          <PanelTitle title={text.stats} meta={text.draft} />
          <SkillGrid language={language} stats={profile.stats} />
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
    </div>
  );
}

function AvatarPreview({
  classLine,
  level,
  nickname
}: {
  classLine: string;
  level: number;
  nickname: string;
}) {
  const initial = nickname.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="profile-avatar-card" aria-label={`${nickname} avatar`}>
      <div className="profile-avatar">
        <span>{initial}</span>
        <b>LV {level.toString().padStart(2, "0")}</b>
      </div>
      <div className="profile-avatar-meta">
        <span>{nickname}</span>
        <strong>{classLine}</strong>
      </div>
    </div>
  );
}

function ProgressScreen({
  achievements,
  dailyHistory,
  dailyStreak,
  language,
  profile,
  progressEvents
}: {
  achievements: PlayerAchievement[];
  dailyHistory: DailyLog[];
  dailyStreak: number;
  language: Language;
  profile: PlayerProfile;
  progressEvents: ProgressEvent[];
}) {
  const text = progressScreenText[language];
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlockedAt);
  const xpPercent = Math.min(100, Math.max(0, (profile.xp / profile.xpToNextLevel) * 100));

  return (
    <div className="progress-layout">
      <section className="progress-hero">
        <div>
          <p className="kicker">{text.currentLevel}</p>
          <h2>LV {profile.level.toString().padStart(2, "0")}</h2>
          <p>{profile.className} / {profile.archetype}</p>
        </div>
        <div className="progress-xp-card">
          <span>{profile.xp}/{profile.xpToNextLevel} XP</span>
          <strong>{text.nextLevel}</strong>
          <small>{dailyStreak} {text.dayStreak}</small>
          <div className="xp-track">
            <div style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </section>

      <div className="progress-grid">
        <section className="panel">
          <PanelTitle title={text.achievements} meta={`${unlockedAchievements.length}/${achievements.length}`} />
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <article className={`achievement-card ${achievement.unlockedAt ? "unlocked" : ""}`} key={achievement.id}>
                <Trophy size={18} />
                <div>
                  <strong>{achievementLabels[language][achievement.id]?.title ?? achievement.title}</strong>
                  <p>{achievementLabels[language][achievement.id]?.description ?? achievement.description}</p>
                  <span>{achievement.unlockedAt ? `${text.unlocked}: ${formatLocalDate(achievement.unlockedAt, language)}` : text.locked}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelTitle title={text.eventLog} meta={`${dailyHistory.length} ${text.dailyLogs}`} />
          <div className="event-list">
            {progressEvents.length === 0 && <p className="muted">{text.emptyEvents}</p>}
            {progressEvents.map((event) => (
              <article className="event-card" key={event.id}>
                <div>
                  <strong>{progressKindLabels[language][event.kind]}</strong>
                  <p>{getProgressEventDetail(event, language)}</p>
                  <span>{formatLocalDateTime(event.createdAt, language)}</span>
                </div>
                {event.xp > 0 && <b>+{event.xp} XP</b>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function WalletsScreen({
  addWallet,
  balanceErrors,
  hideUnpricedTokens,
  isRefreshing,
  language,
  message,
  refreshBalances,
  removeWallet,
  setHideUnpricedTokens,
  setThreshold,
  text,
  threshold,
  updatedAt,
  visibleBalances,
  wallets
}: {
  addWallet: (event: FormEvent<HTMLFormElement>) => void;
  balanceErrors: string[];
  hideUnpricedTokens: boolean;
  isRefreshing: boolean;
  language: Language;
  message: string;
  refreshBalances: () => void;
  removeWallet: (id: string) => void;
  setHideUnpricedTokens: (value: boolean) => void;
  setThreshold: (value: number) => void;
  text: typeof t.en.wallets;
  threshold: number;
  updatedAt: string;
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
        <div className="wallet-actions">
          <button className="primary-button" disabled={isRefreshing || wallets.length === 0} type="button" onClick={refreshBalances}>
            {isRefreshing ? text.refreshing : text.refresh}
          </button>
          <span>{updatedAt ? `${text.lastUpdated}: ${formatLocalDateTime(updatedAt, language)}` : text.neverUpdated}</span>
        </div>
        <label className="threshold-control">
          <span>{text.threshold}</span>
          <input min={0} onChange={(event) => setThreshold(Number(event.target.value || 0))} step={0.5} type="number" value={threshold} />
        </label>
        <label className="spam-toggle">
          <input checked={hideUnpricedTokens} onChange={(event) => setHideUnpricedTokens(event.target.checked)} type="checkbox" />
          <span>{text.hideUnpriced}</span>
        </label>
        {balanceErrors.length > 0 && (
          <div className="error-list">
            {balanceErrors.map((error) => <div key={error}>{error}</div>)}
          </div>
        )}
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
                <tr key={`${balance.walletId}-${balance.chain}-${balance.network}-${balance.symbol}-${balance.contractAddress ?? "native"}`}>
                  <td><strong>{balance.symbol}</strong><span>{balance.walletLabel}</span></td>
                  <td>{balance.network}</td>
                  <td>{formatAmount(balance.amount)}</td>
                  <td>{balance.isPriced === false ? text.unpriced : formatUsd(balance.usdValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function QuestsScreen({
  language,
  onCompleteQuest,
  questGroups,
  setQuestGroups
}: {
  language: Language;
  onCompleteQuest: (groupId: string, questId: string) => void;
  questGroups: QuestGroup[];
  setQuestGroups: Dispatch<SetStateAction<QuestGroup[]>>;
}) {
  const text = extendedQuestScreenText[language];
  const [selectedGroupId, setSelectedGroupId] = useState(questGroups[0]?.id ?? "");
  const selectedGroup = questGroups.find((group) => group.id === selectedGroupId) ?? questGroups[0];

  useEffect(() => {
    if (!selectedGroup && questGroups[0]) {
      setSelectedGroupId(questGroups[0].id);
    }
  }, [questGroups, selectedGroup]);

  function addGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    if (!title) return;

    const group: QuestGroup = {
      id: createEntityId("quest-group"),
      title,
      description,
      quests: [],
      createdAt: new Date().toISOString()
    };

    setQuestGroups((current) => [...current, group]);
    setSelectedGroupId(group.id);
    event.currentTarget.reset();
  }

  function addQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedGroup) return;

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const difficulty = String(form.get("difficulty") || "normal") as QuestDifficulty;
    const rewardXp = Number(form.get("rewardXp") || questDefaultXpByDifficulty[difficulty]);
    const dueDate = String(form.get("dueDate") || "").trim();
    const statReward = String(form.get("statReward") || "").trim();
    const statPoints = Number(form.get("statPoints") || questDefaultStatPointsByDifficulty[difficulty]);
    if (!title) return;

    setQuestGroups((current) => current.map((group) => group.id === selectedGroup.id
      ? {
        ...group,
        quests: [
          ...group.quests,
          {
            id: createEntityId("quest"),
            title,
            notes,
            completed: false,
            createdAt: new Date().toISOString(),
            difficulty,
            dueDate,
            rewardXp: Number.isFinite(rewardXp) && rewardXp >= 0 ? rewardXp : questDefaultXpByDifficulty[difficulty],
            statPoints: Number.isFinite(statPoints) && statPoints >= 0 ? statPoints : questDefaultStatPointsByDifficulty[difficulty],
            statReward
          }
        ]
      }
      : group
    ));
    event.currentTarget.reset();
  }

  function toggleQuest(groupId: string, questId: string) {
    const group = questGroups.find((item) => item.id === groupId);
    const quest = group?.quests.find((item) => item.id === questId);

    if (quest && !quest.completed) {
      onCompleteQuest(groupId, questId);
      return;
    }

    setQuestGroups((current) => current.map((group) => group.id === groupId
      ? {
        ...group,
        quests: group.quests.map((quest) => quest.id === questId
          ? { ...quest, completed: false, completedAt: undefined }
          : quest
        )
      }
      : group
    ));
  }

  function deleteQuest(groupId: string, questId: string) {
    setQuestGroups((current) => current.map((group) => group.id === groupId
      ? { ...group, quests: group.quests.filter((quest) => quest.id !== questId) }
      : group
    ));
  }

  return (
    <div className="quest-layout">
      <section className="panel quest-sidebar">
        <PanelTitle title={text.groups} meta={`${questGroups.length}`} />
        <form className="compact-form" onSubmit={addGroup}>
          <input name="title" placeholder={text.groupName} />
          <input name="description" placeholder={text.groupDescription} />
          <button className="primary-button" type="submit">{text.addGroup}</button>
        </form>
        <div className="quest-group-list">
          {questGroups.length === 0 && <p className="muted">{text.emptyGroups}</p>}
          {questGroups.map((group) => (
            <button
              className={group.id === selectedGroup?.id ? "active" : ""}
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              type="button"
            >
              <strong>{group.title}</strong>
              <span>{group.quests.filter((quest) => !quest.completed).length}/{group.quests.length}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel quest-main">
        <PanelTitle title={selectedGroup?.title ?? text.groups} meta={selectedGroup?.description ?? ""} />
        {selectedGroup && (
          <form className="quest-form" onSubmit={addQuest}>
            <input name="title" placeholder={text.questTitle} />
            <input name="notes" placeholder={text.questNotes} />
            <select name="difficulty" defaultValue="normal" aria-label={text.difficulty}>
              {questDifficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{text[difficulty]}</option>
              ))}
            </select>
            <input min={0} name="rewardXp" placeholder={text.rewardXp} type="number" />
            <select name="statReward" defaultValue="" aria-label={text.statReward}>
              <option value="">{text.noStatReward}</option>
              {playerStats.map((stat) => (
                <option key={stat.label} value={stat.label}>{statLabels[language][stat.label] ?? stat.label}</option>
              ))}
            </select>
            <input min={0} name="statPoints" placeholder={text.statPoints} type="number" />
            <input name="dueDate" aria-label={text.dueDate} type="date" />
            <button className="primary-button" type="submit">{text.addQuest}</button>
          </form>
        )}
        <div className="quest-list">
          {selectedGroup && selectedGroup.quests.length === 0 && <p className="muted">{text.noQuests}</p>}
          {selectedGroup?.quests.map((rawQuest) => {
            const quest = normalizeQuest(rawQuest);

            return (
            <div className={`quest-item ${quest.completed ? "completed" : ""}`} key={quest.id}>
              <label>
                <input checked={quest.completed} onChange={() => toggleQuest(selectedGroup.id, quest.id)} type="checkbox" />
                <span>{text.completed}</span>
              </label>
              <div>
                <strong>{quest.title}</strong>
                <div className="quest-meta-row">
                  <span>{text[quest.difficulty ?? "normal"]}</span>
                  <span>+{quest.rewardXp ?? 0} XP</span>
                  {quest.statReward && <span>+{quest.statPoints ?? 0} {statLabels[language][quest.statReward] ?? quest.statReward}</span>}
                  {quest.dueDate && <span>{quest.dueDate}</span>}
                </div>
                {quest.notes && <p>{quest.notes}</p>}
              </div>
              <button type="button" onClick={() => deleteQuest(selectedGroup.id, quest.id)}>{text.delete}</button>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function KnowledgeScreen({
  inventoryItems,
  knowledgeNotes,
  language,
  onNoteCreated,
  setKnowledgeNotes
}: {
  inventoryItems: InventoryItem[];
  knowledgeNotes: KnowledgeNote[];
  language: Language;
  onNoteCreated: (note: KnowledgeNote) => void;
  setKnowledgeNotes: Dispatch<SetStateAction<KnowledgeNote[]>>;
}) {
  const text = extendedKnowledgeScreenText[language];
  const [selectedNoteId, setSelectedNoteId] = useState(knowledgeNotes[0]?.id ?? "");
  const selectedNote = knowledgeNotes.find((note) => note.id === selectedNoteId) ?? knowledgeNotes[0];
  const normalizedSelectedNote = selectedNote ? normalizeKnowledgeNote(selectedNote) : undefined;
  const [draftTitle, setDraftTitle] = useState(selectedNote?.title ?? "");
  const [draftBody, setDraftBody] = useState(selectedNote?.body ?? "");
  const [draftKind, setDraftKind] = useState<KnowledgeNoteKind>(normalizedSelectedNote?.kind ?? "note");
  const [draftTags, setDraftTags] = useState(normalizedSelectedNote?.tags?.join(", ") ?? "");
  const [draftInventoryItemId, setDraftInventoryItemId] = useState(normalizedSelectedNote?.linkedInventoryItemId ?? "");

  useEffect(() => {
    if (!selectedNote && knowledgeNotes[0]) {
      setSelectedNoteId(knowledgeNotes[0].id);
    }
  }, [knowledgeNotes, selectedNote]);

  useEffect(() => {
    const normalizedNote = selectedNote ? normalizeKnowledgeNote(selectedNote) : undefined;

    setDraftTitle(selectedNote?.title ?? "");
    setDraftBody(selectedNote?.body ?? "");
    setDraftKind(normalizedNote?.kind ?? "note");
    setDraftTags(normalizedNote?.tags?.join(", ") ?? "");
    setDraftInventoryItemId(normalizedNote?.linkedInventoryItemId ?? "");
  }, [selectedNote]);

  function createNote() {
    const now = new Date().toISOString();
    const note: KnowledgeNote = {
      id: createEntityId("note"),
      title: text.newNote,
      body: "",
      kind: "note",
      tags: [],
      linkedInventoryItemId: "",
      createdAt: now,
      updatedAt: now
    };
    setKnowledgeNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
    onNoteCreated(note);
  }

  function saveNote() {
    if (!selectedNote) return;
    const now = new Date().toISOString();
    setKnowledgeNotes((current) => current.map((note) => note.id === selectedNote.id
      ? {
        ...note,
        title: draftTitle.trim() || text.newNote,
        body: draftBody,
        kind: draftKind,
        tags: draftTags.split(",").map((tag) => tag.trim()).filter(Boolean),
        linkedInventoryItemId: draftInventoryItemId,
        updatedAt: now
      }
      : note
    ));
  }

  function deleteNote() {
    if (!selectedNote) return;
    setKnowledgeNotes((current) => current.filter((note) => note.id !== selectedNote.id));
    setSelectedNoteId("");
  }

  return (
    <div className="knowledge-layout">
      <section className="panel note-sidebar">
        <PanelTitle title={text.notes} meta={`${knowledgeNotes.length}`} />
        <button className="primary-button" type="button" onClick={createNote}>{text.newNote}</button>
        <div className="note-list">
          {knowledgeNotes.length === 0 && <p className="muted">{text.empty}</p>}
          {knowledgeNotes.map((rawNote) => {
            const note = normalizeKnowledgeNote(rawNote);
            const linkedItem = inventoryItems.find((item) => item.id === note.linkedInventoryItemId);

            return (
            <button
              className={note.id === selectedNote?.id ? "active" : ""}
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              type="button"
            >
              <strong>{note.title}</strong>
              <small>{text.kinds[note.kind ?? "note"]}{linkedItem ? ` / ${linkedItem.title}` : ""}</small>
              <span>{text.updated}: {formatLocalDate(note.updatedAt, language)}</span>
              {note.tags && note.tags.length > 0 && (
                <div className="tag-row">
                  {note.tags.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}
                </div>
              )}
            </button>
            );
          })}
        </div>
      </section>

      <section className="panel note-editor">
        <div className="note-meta-grid">
          <label>
            <span>{text.kind}</span>
            <select disabled={!selectedNote} onChange={(event) => setDraftKind(event.target.value as KnowledgeNoteKind)} value={draftKind}>
              {knowledgeKinds.map((kind) => (
                <option key={kind} value={kind}>{text.kinds[kind]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{text.linkedItem}</span>
            <select disabled={!selectedNote} onChange={(event) => setDraftInventoryItemId(event.target.value)} value={draftInventoryItemId}>
              <option value="">{text.noLinkedItem}</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span>{text.title}</span>
          <input disabled={!selectedNote} onChange={(event) => setDraftTitle(event.target.value)} value={draftTitle} />
        </label>
        <label>
          <span>{text.tags}</span>
          <input disabled={!selectedNote} onChange={(event) => setDraftTags(event.target.value)} placeholder={text.tagsPlaceholder} value={draftTags} />
        </label>
        <label>
          <span>{text.body}</span>
          <textarea disabled={!selectedNote} onChange={(event) => setDraftBody(event.target.value)} value={draftBody} />
        </label>
        <div className="editor-actions">
          <button className="primary-button" disabled={!selectedNote} onClick={saveNote} type="button">{text.save}</button>
          <button className="secondary-button" disabled={!selectedNote} onClick={deleteNote} type="button">{text.delete}</button>
        </div>
      </section>
    </div>
  );
}

function SkillsScreen({ language, stats }: { language: Language; stats: PlayerStat[] }) {
  return (
    <section className="panel">
      <PanelTitle title={t[language].sections.skills[0]} meta={t[language].sections.skills[1]} />
      <SkillGrid language={language} stats={stats} />
    </section>
  );
}

function SkillGrid({ language, stats }: { language: Language; stats?: PlayerStat[] }) {
  const visibleStats = stats && stats.length > 0 ? stats : playerStats;

  return (
    <div className="stat-grid">
      {visibleStats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <span>{statLabels[language][stat.label] ?? stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen({
  exportBackup,
  importBackup,
  language,
  providers,
  setLanguage,
  setProviders,
  setTheme,
  text,
  theme
}: {
  exportBackup: () => void;
  importBackup: (file: File) => Promise<boolean>;
  language: Language;
  providers: ProviderConfig;
  setLanguage: (language: Language) => void;
  setProviders: (providers: ProviderConfig) => void;
  setTheme: (theme: Theme) => void;
  text: typeof t.en.settings;
  theme: Theme;
}) {
  const backupText = backupScreenText[language];
  const [backupStatus, setBackupStatus] = useState("");

  function updateProvider<K extends keyof ProviderConfig>(key: K, value: ProviderConfig[K]) {
    setProviders({ ...providers, [key]: value });
  }

  function toggleNetwork(networkId: ProviderConfig["enabledEvmNetworks"][number]) {
    const enabled = providers.enabledEvmNetworks.includes(networkId);
    setProviders({
      ...providers,
      enabledEvmNetworks: enabled
        ? providers.enabledEvmNetworks.filter((id) => id !== networkId)
        : [...providers.enabledEvmNetworks, networkId]
    });
  }

  function handleExport() {
    exportBackup();
    setBackupStatus(backupText.statusExported);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const imported = await importBackup(file);
    setBackupStatus(imported ? backupText.statusImported : backupText.statusInvalid);
    event.target.value = "";
  }

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

      <section className="panel settings-panel">
        <PanelTitle title={text.providers} meta={text.providersMeta} />
        <label className="settings-control">
          <div className="settings-control-title">
            <Shield size={16} />
            <span>{text.alchemy}</span>
          </div>
          <input
            autoComplete="off"
            onChange={(event) => updateProvider("alchemyApiKey", event.target.value)}
            placeholder={text.keyPlaceholder}
            type="password"
            value={providers.alchemyApiKey}
          />
        </label>
        <label className="settings-control">
          <div className="settings-control-title">
            <Shield size={16} />
            <span>{text.helius}</span>
          </div>
          <input
            autoComplete="off"
            onChange={(event) => updateProvider("heliusApiKey", event.target.value)}
            placeholder={text.keyPlaceholder}
            type="password"
            value={providers.heliusApiKey}
          />
        </label>
        <label className="settings-control">
          <div className="settings-control-title">
            <CircleDollarSign size={16} />
            <span>{text.minUsd}</span>
          </div>
          <input
            min={0}
            onChange={(event) => updateProvider("minUsdValue", Number(event.target.value || 0))}
            step={0.5}
            type="number"
            value={providers.minUsdValue}
          />
        </label>
        <label className="settings-check">
          <input
            checked={providers.hideUnpricedTokens}
            onChange={(event) => updateProvider("hideUnpricedTokens", event.target.checked)}
            type="checkbox"
          />
          <span>{text.hideUnpriced}</span>
        </label>
        <div className="settings-control">
          <div className="settings-control-title">
            <span>{text.evmNetworks}</span>
          </div>
          <div className="network-list">
            {evmNetworks.map((network) => (
              <label key={network.id}>
                <input
                  checked={providers.enabledEvmNetworks.includes(network.id)}
                  onChange={() => toggleNetwork(network.id)}
                  type="checkbox"
                />
                <span>{network.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="panel settings-note">
        <PanelTitle title={text.noteTitle} meta={text.registration} />
        <p>{text.note}</p>
      </section>

      <section className="panel settings-backup">
        <PanelTitle title={backupText.title} meta={backupText.meta} />
        <p>{backupText.note}</p>
        <div className="backup-actions">
          <button className="secondary-button" type="button" onClick={handleExport}>
            <Download size={16} />
            <span>{backupText.export}</span>
          </button>
          <label className="secondary-button backup-import">
            <Upload size={16} />
            <span>{backupText.import}</span>
            <input accept="application/json,.json" onChange={handleImport} type="file" />
          </label>
        </div>
        {backupStatus && <div className="backup-status">{backupStatus}</div>}
      </section>
    </div>
  );
}

function InventoryScreen({
  inventoryItems,
  language,
  onItemCreated,
  setInventoryItems
}: {
  inventoryItems: InventoryItem[];
  language: Language;
  onItemCreated: (item: InventoryItem) => void;
  setInventoryItems: Dispatch<SetStateAction<InventoryItem[]>>;
}) {
  const text = inventoryScreenText[language];
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | "all">("all");
  const visibleItems = selectedCategory === "all"
    ? inventoryItems
    : inventoryItems.filter((item) => item.category === selectedCategory);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();

    if (!title) {
      return;
    }

    const now = new Date().toISOString();
    const item: InventoryItem = {
      id: createEntityId("inventory"),
      title,
      category: String(form.get("category") || "resource") as InventoryCategory,
      notes: String(form.get("notes") || "").trim(),
      link: String(form.get("link") || "").trim(),
      value: String(form.get("value") || "").trim(),
      createdAt: now,
      updatedAt: now
    };

    setInventoryItems((current) => [item, ...current]);
    onItemCreated(item);
    event.currentTarget.reset();
  }

  function removeItem(itemId: string) {
    setInventoryItems((current) => current.filter((item) => item.id !== itemId));
  }

  return (
    <div className="inventory-layout">
      <section className="inventory-summary">
        <button
          className={selectedCategory === "all" ? "active" : ""}
          onClick={() => setSelectedCategory("all")}
          type="button"
        >
          <strong>{text.all}</strong>
          <span>{inventoryItems.length}</span>
        </button>
        {inventoryCategories.map((category) => (
          <button
            className={selectedCategory === category.id ? "active" : ""}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            type="button"
          >
            <strong>{inventoryCategoryLabels[language][category.id]}</strong>
            <span>{inventoryItems.filter((item) => item.category === category.id).length}</span>
          </button>
        ))}
      </section>

      <section className="panel inventory-form-panel">
        <PanelTitle title={text.add} meta={text.localItem} />
        <form className="inventory-form" onSubmit={addItem}>
          <label>
            <span>{text.title}</span>
            <input name="title" placeholder={text.titlePlaceholder} />
          </label>
          <label>
            <span>{text.category}</span>
            <select name="category" defaultValue="resource">
              {inventoryCategories.map((category) => (
                <option key={category.id} value={category.id}>{inventoryCategoryLabels[language][category.id]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{text.value}</span>
            <input name="value" placeholder={text.valuePlaceholder} />
          </label>
          <label>
            <span>{text.link}</span>
            <input name="link" placeholder={text.linkPlaceholder} />
          </label>
          <label className="wide-field">
            <span>{text.notes}</span>
            <textarea name="notes" placeholder={text.notesPlaceholder} />
          </label>
          <button className="primary-button" type="submit">{text.add}</button>
        </form>
      </section>

      <section className="panel inventory-list-panel">
        <PanelTitle title={text.items} meta={`${visibleItems.length}`} />
        <div className="inventory-list">
          {visibleItems.length === 0 && <p className="muted">{text.empty}</p>}
          {visibleItems.map((item) => {
            return (
              <article className="inventory-item-card" key={item.id}>
                <div>
                  <span>{inventoryCategoryLabels[language][item.category]}</span>
                  <strong>{item.title}</strong>
                  {item.notes && <p>{item.notes}</p>}
                  {item.link && <code>{item.link}</code>}
                </div>
                <aside>
                  {item.value && <b>{item.value}</b>}
                  <small>{text.updated}: {formatLocalDate(item.updatedAt, language)}</small>
                  <button type="button" onClick={() => removeItem(item.id)}>{text.remove}</button>
                </aside>
              </article>
            );
          })}
        </div>
      </section>
    </div>
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
