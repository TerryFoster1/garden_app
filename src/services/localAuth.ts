import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_AUTH_KEY = "pattypan:local-auth:v1";

export type LocalAccount = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export type LocalSession = {
  accountId: string;
  email: string;
  displayName: string;
  signedInAt: string;
};

type LocalAuthStore = {
  accounts: LocalAccount[];
  session?: LocalSession;
};

export type AuthResult =
  | { ok: true; session: LocalSession }
  | { ok: false; error: string };

export async function loadLocalSession(): Promise<LocalSession | null> {
  const store = await loadStore();
  return store.session ?? null;
}

export async function signUpLocal(input: { email: string; password: string; confirmPassword: string; displayName: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const validationError = validateAuthInput(email, input.password, displayName);
  if (validationError) {
    return { ok: false, error: validationError };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  const store = await loadStore();
  if (store.accounts.some((account) => account.email === email)) {
    return { ok: false, error: "A local account already exists for this email. Sign in instead." };
  }

  const salt = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const account: LocalAccount = {
    id: `local-${Date.now()}`,
    email,
    displayName,
    passwordSalt: salt,
    passwordHash: hashPassword(input.password, salt),
    createdAt: new Date().toISOString()
  };
  const session: LocalSession = {
    accountId: account.id,
    email,
    displayName,
    signedInAt: new Date().toISOString()
  };

  await saveStore({ accounts: [account, ...store.accounts], session });
  return { ok: true, session };
}

export async function signInLocal(input: { email: string; password: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const store = await loadStore();
  const account = store.accounts.find((item) => item.email === email);
  if (!account) {
    return { ok: false, error: "No local account exists for that email on this device." };
  }
  if (hashPassword(input.password, account.passwordSalt) !== account.passwordHash) {
    return { ok: false, error: "That password does not match this local account." };
  }

  const session: LocalSession = {
    accountId: account.id,
    email: account.email,
    displayName: account.displayName,
    signedInAt: new Date().toISOString()
  };
  await saveStore({ ...store, session });
  return { ok: true, session };
}

export async function clearLocalAuth(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_AUTH_KEY);
}

export async function signOutLocal(): Promise<void> {
  const store = await loadStore();
  await saveStore({ ...store, session: undefined });
}

function validateAuthInput(email: string, password: string, displayName: string) {
  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!displayName) {
    return "Enter a display name.";
  }
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function loadStore(): Promise<LocalAuthStore> {
  const raw = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
  if (!raw) {
    return { accounts: [] };
  }
  try {
    return JSON.parse(raw) as LocalAuthStore;
  } catch {
    return { accounts: [] };
  }
}

async function saveStore(store: LocalAuthStore) {
  await AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(store));
}

function hashPassword(password: string, salt: string) {
  // Prototype-only non-cryptographic hash. Production must use server-side auth.
  let hash = 5381;
  const value = `${salt}:${password}`;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return `local-djb2-${Math.abs(hash)}`;
}
