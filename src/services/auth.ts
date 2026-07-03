const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "next_commerce_auth_token";
const USER_KEY = "next_commerce_user";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
  role?: "super_admin" | "admin" | "staff" | "customer" | string | null;
  created_at?: string | null;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
  admin_url?: string | null;
};

function requireApiUrl() {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  return API_URL;
}

function apiOrigin() {
  if (!API_URL) {
    return "";
  }

  return new URL(API_URL).origin;
}

function normalizeUser(user: AuthUser): AuthUser {
  if (user.avatar_url) {
    try {
      const avatarUrl = new URL(user.avatar_url);

      if (
        avatarUrl.pathname.startsWith("/storage/") &&
        avatarUrl.origin !== apiOrigin()
      ) {
        return {
          ...user,
          avatar_url: `${apiOrigin()}${avatarUrl.pathname}`,
        };
      }
    } catch {
      // Relative URLs are handled below.
    }
  }

  if (user.avatar_url?.startsWith("/")) {
    return {
      ...user,
      avatar_url: `${apiOrigin()}${user.avatar_url}`,
    };
  }

  if (!user.avatar_url && user.avatar_path) {
    return {
      ...user,
      avatar_url: `${apiOrigin()}/storage/${user.avatar_path}`,
    };
  }

  return user;
}

async function authRequest(path: string, payload: Record<string, unknown>) {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || data?.message || "Authentication failed");
  }

  return data as AuthResponse;
}

export async function login(payload: { email: string; password: string }) {
  const data = await authRequest("/auth/login", payload);
  saveAuth(data);

  return { ...data, user: normalizeUser(data.user) };
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const data = await authRequest("/auth/register", payload);
  saveAuth(data);

  return { ...data, user: normalizeUser(data.user) };
}

export function startGoogleLogin() {
  const apiUrl = requireApiUrl();

  window.location.href = `${apiUrl}/auth/google/redirect`;
}

export async function exchangeSocialLoginCode(code: string) {
  const data = await authRequest("/auth/social/exchange", { code });
  saveAuth(data);

  return { ...data, user: normalizeUser(data.user) };
}

export async function logout() {
  const token = getToken();

  if (token) {
    const apiUrl = API_URL;

    if (apiUrl) {
      await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      }).catch(() => null);
    }
  }

  clearAuth();
}

export async function fetchCurrentUser() {
  const data = await authenticatedRequest<{ user: AuthUser }>("/auth/me");
  const user = normalizeUser(data.user);
  saveUser(user);

  return user;
}

export async function updateProfile(payload: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}) {
  const data = await authenticatedRequest<{ message: string; user: AuthUser }>(
    "/auth/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  const user = normalizeUser(data.user);
  saveUser(user);
  window.dispatchEvent(new Event("auth-changed"));

  return { ...data, user };
}

export async function updateProfileImage(file: File) {
  const body = new FormData();
  body.append("avatar", file);

  const data = await authenticatedRequest<{ message: string; user: AuthUser }>(
    "/auth/profile/avatar",
    {
      method: "POST",
      body,
    }
  );
  const user = normalizeUser(data.user);
  saveUser(user);
  window.dispatchEvent(new Event("auth-changed"));

  return { ...data, user };
}

export async function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return authenticatedRequest<{ message: string }>("/auth/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchAccountOrders(page = 1) {
  return authenticatedRequest<{
    orders: Array<{
      id: number;
      order_number: string;
      payment_token: string;
      status: string;
      date: string | null;
      total: number;
      items_count: number;
      items: Array<{
        title: string;
        quantity: number;
        unit_price: number;
        line_total: number;
      }>;
    }>;
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>(`/orders?page=${page}&per_page=10`);
}

export async function forgotPassword(email: string) {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/auth/forgot-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || data?.message || "Unable to send reset link");
  }

  return data as { message: string; reset_url?: string };
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/auth/reset-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || data?.message || "Unable to reset password");
  }

  return data as { message: string };
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = window.localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(user));
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

function saveAuth(data: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, data.token);
  saveUser(normalizeUser(data.user));
  window.dispatchEvent(new Event("auth-changed"));
}

function saveUser(user: AuthUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
}

function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

async function authenticatedRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to continue.");
  }

  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(!(init.body instanceof FormData) && {
        "Content-Type": "application/json",
      }),
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || data?.message || "Request failed");
  }

  return data as T;
}
