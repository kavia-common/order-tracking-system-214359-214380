/**
 * Fetch-based API client for the Order Tracker frontend.
 *
 * Backend base URL is configured via REACT_APP_API_BASE_URL.
 * Note: CRA only exposes environment variables prefixed with REACT_APP_.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function getApiBaseUrl() {
  const raw = process.env.REACT_APP_API_BASE_URL;
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // If backend returns non-JSON, keep as text for diagnostics.
    return { message: text };
  }
}

/**
 * Creates a normalized Error object from a failed HTTP response.
 */
function httpError(status, payload) {
  const message =
    payload?.detail ||
    payload?.message ||
    payload?.error ||
    `Request failed with status ${status}`;
  const err = new Error(message);
  err.status = status;
  err.payload = payload;
  return err;
}

// PUBLIC_INTERFACE
export async function apiRequest(path, { method = "GET", body, token, headers } = {}) {
  /**
   * Make an API request to the backend.
   * @param {string} path - Path starting with "/" (e.g. "/orders/123").
   * @param {object} options - method/body/token/headers
   * @returns {Promise<any>} Parsed JSON response body (or null)
   */
  const baseUrl = getApiBaseUrl();

  // Allow relative fetch for local dev via CRA proxy, if configured later.
  const url = baseUrl ? `${baseUrl}${path}` : path;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetchWithTimeout(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    // Network error / timeout
    const err = new Error(e?.name === "AbortError" ? "Request timed out" : "Network error");
    err.cause = e;
    throw err;
  }

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw httpError(response.status, payload);
  }

  return payload;
}

// PUBLIC_INTERFACE
export const Api = {
  /** Health check (currently the only implemented backend endpoint). */
  health: () => apiRequest("/", { method: "GET" }),

  /**
   * Placeholder APIs for upcoming backend implementation.
   * These are wired into the UI now, and will work once the backend exposes them.
   */
  auth: {
    login: (email, password) => apiRequest("/auth/login", { method: "POST", body: { email, password } }),
    signup: (email, password) => apiRequest("/auth/signup", { method: "POST", body: { email, password } }),
    me: (token) => apiRequest("/auth/me", { method: "GET", token }),
  },

  orders: {
    lookup: (orderNumber) => apiRequest(`/orders/lookup?order_number=${encodeURIComponent(orderNumber)}`, { method: "GET" }),
    listMine: (token) => apiRequest("/orders", { method: "GET", token }),
    getById: (token, id) => apiRequest(`/orders/${encodeURIComponent(id)}`, { method: "GET", token }),
    history: (token) => apiRequest("/orders/history", { method: "GET", token }),
  },

  notifications: {
    get: (token) => apiRequest("/notifications/settings", { method: "GET", token }),
    update: (token, settings) =>
      apiRequest("/notifications/settings", { method: "PUT", token, body: settings }),
  },

  admin: {
    createOrder: (token, order) => apiRequest("/admin/orders", { method: "POST", token, body: order }),
    updateStatus: (token, id, status) =>
      apiRequest(`/admin/orders/${encodeURIComponent(id)}/status`, { method: "PUT", token, body: { status } }),
  },
};
