export const AUTH_STORAGE_KEY = "tutorial-heaven-auth";

const USER_FLAGS_STORAGE_KEY = "tutorial-heaven-mock-user-flags";

type MockAuthUser = {
  id?: number | string;
  email?: string;
  [key: string]: unknown;
};

type UserFlags = {
  needsOnboarding?: boolean;
};

type UserFlagsStore = Record<string, UserFlags>;

function canUseStorage() {
  return typeof window !== "undefined";
}

function getUserStorageKey(user: MockAuthUser | null | undefined) {
  if (user?.id !== undefined && user.id !== null) {
    return `id:${String(user.id)}`;
  }

  if (typeof user?.email === "string" && user.email.trim()) {
    return `email:${user.email.trim().toLowerCase()}`;
  }

  return "anonymous";
}

function hasAssignedTags(user: MockAuthUser | null | undefined) {
  return Array.isArray(user?.tags) && user.tags.length > 0;
}

function readUserFlagsStore(): UserFlagsStore {
  if (!canUseStorage()) {
    return {};
  }

  const rawValue = window.localStorage.getItem(USER_FLAGS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as UserFlagsStore;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    window.localStorage.removeItem(USER_FLAGS_STORAGE_KEY);
    return {};
  }
}

function writeUserFlagsStore(store: UserFlagsStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_FLAGS_STORAGE_KEY, JSON.stringify(store));
}

export function getStoredAuthUser() {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as { user?: MockAuthUser };
    return parsed.user ?? null;
  } catch {
    return null;
  }
}

export function getNeedsOnboarding(user: MockAuthUser | null | undefined) {
  const store = readUserFlagsStore();
  const userKey = getUserStorageKey(user);
  const storedValue = store[userKey]?.needsOnboarding;

  return typeof storedValue === "boolean" ? storedValue : true;
}

export function initializeNeedsOnboarding(user: MockAuthUser | null | undefined) {
  const store = readUserFlagsStore();
  const userKey = getUserStorageKey(user);
  const storedValue = store[userKey]?.needsOnboarding;

  if (typeof storedValue === "boolean") {
    return storedValue;
  }

  // Quem já tem tags atribuídas no backend não precisa refazer o onboarding.
  const needsOnboarding = !hasAssignedTags(user);

  store[userKey] = {
    ...store[userKey],
    needsOnboarding,
  };

  writeUserFlagsStore(store);
  return needsOnboarding;
}

export function setNeedsOnboarding(user: MockAuthUser | null | undefined, value: boolean) {
  const store = readUserFlagsStore();
  const userKey = getUserStorageKey(user);

  store[userKey] = {
    ...store[userKey],
    needsOnboarding: value,
  };

  writeUserFlagsStore(store);
}