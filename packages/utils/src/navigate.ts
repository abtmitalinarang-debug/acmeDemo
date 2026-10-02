export type AppName = "website" | "cart" | "product";

export interface AppEntry {
  prefix: string;
  baseUrl: () => string;
}
export const APP_REGISTRY: Record<AppName, AppEntry> = {
  website: {
    prefix: "/",
    baseUrl: () =>
      (typeof process !== "undefined" &&
        process.env["NEXT_PUBLIC_WEBSITE_URL"]) ||
      "http://localhost:3001",
  },
  cart: {
    prefix: "/cart",
    baseUrl: () =>
      (typeof process !== "undefined" && process.env["NEXT_PUBLIC_CART_URL"]) ||
      "http://localhost:3008",
  },
  product: {
    prefix: "/product",
    baseUrl: () =>
      (typeof process !== "undefined" &&
        process.env["NEXT_PUBLIC_PRODUCT_URL"]) ||
      "http://localhost:3000",
  },
};

export function resolveApp(path: string): AppName {
  const entries = Object.entries(APP_REGISTRY) as [AppName, AppEntry][];
  const sorted = entries.sort(
    (a, b) => b[1].prefix.length - a[1].prefix.length,
  );

  for (const [appName, entry] of sorted) {
    if (entry.prefix === "/") continue;
    if (path === entry.prefix || path.startsWith(entry.prefix + "/")) {
      return appName;
    }
  }

  return "website";
}

export function currentApp(): AppName {
  if (typeof window === "undefined") return "website";

  const origin = window.location.origin;
  const entries = Object.entries(APP_REGISTRY) as [AppName, AppEntry][];

  for (const [appName, entry] of entries) {
    if (entry.baseUrl() === origin) return appName;
  }

  return "website";
}

export function isCrossApp(path: string): boolean {
  return resolveApp(path) !== currentApp();
}

export interface NavigateOptions {
  replace?: boolean;
  query?: Record<string, string>;
}

export function navigate(path: string, options: NavigateOptions = {}): void {
  if (typeof window === "undefined") {
    console.warn("[navigate] called in a non-browser environment — no-op.");
    return;
  }

  const { replace = false, query } = options;

  const fullPath = buildPath(path, query);

  if (isCrossApp(path)) {
    const targetApp = resolveApp(path);
    const targetOrigin = APP_REGISTRY[targetApp].baseUrl();
    const url = `${targetOrigin}${fullPath}`;

    if (replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  } else {
    if (replace) {
      window.history.replaceState(null, "", fullPath);
    } else {
      window.history.pushState(null, "", fullPath);
    }

    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
  }
}

function buildPath(path: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return path;
  const params = new URLSearchParams(query).toString();
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${params}`;
}

export function absoluteUrl(
  path: string,
  query?: Record<string, string>,
): string {
  const targetApp = resolveApp(path);
  const origin = APP_REGISTRY[targetApp].baseUrl();
  return `${origin}${buildPath(path, query)}`;
}
