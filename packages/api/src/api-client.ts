
import { env } from "@repo/env";

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}

interface ApiClientConfig {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    excludedAuthRoutes?: string[];
}

export class ApiClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    private excludedAuthRoutes: string[];

    private getTokenFn = "";

    constructor(config: ApiClientConfig = {}) {
        this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
        this.excludedAuthRoutes = config.excludedAuthRoutes || ['/auth/login', '/auth/register'];

        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.defaultHeaders,
        };
    }

    private isExcludedRoute(endpoint: string): boolean {
        const cleanEndpoint = endpoint?.startsWith('/') ? endpoint : `/${endpoint}`;
        return this.excludedAuthRoutes?.some((route) => cleanEndpoint?.startsWith(route));
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...customConfig } = options;
        let url = `${this.baseUrl}${endpoint?.startsWith('/') ? endpoint : `/${endpoint}`}`;
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(
                Object.entries(params).map(([k, v]) => [k, String(v)])
            );
            url += `?${searchParams.toString()}`;
        }

        const requestHeaders: Record<string, string> = {
            ...this.defaultHeaders,
            ...headers,
        };
        if (!this.isExcludedRoute(endpoint)) {
            const token = await Promise.resolve("");
            if (token) {
                requestHeaders['Authorization'] = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            ...customConfig,
            headers: requestHeaders,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `HTTP Error ${response.status}: ${response.statusText}`
                );
            }

            if (response.status === 204) {
                return {} as T;
            }

            return (await response.json()) as T;
        } catch (error) {
            console.error(`API Request Failed: ${options.method || 'GET'} ${url}`, error);
            throw error;
        }
    }


    public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}
export const api = new ApiClient({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    excludedAuthRoutes: ['/auth/login', '/auth/register', '/public'],
});