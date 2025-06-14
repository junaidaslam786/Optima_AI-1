// lib/api-client.ts
import { getSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

type JsonBody =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: JsonBody;
}

async function apiClient<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    headers,
    token,
    ...customConfig
  }: ApiClientOptions = {}
): Promise<T> {
  let authToken: string | undefined | null = token;

  // If no token is explicitly provided, get it from NextAuth.js session
  if (authToken === undefined) {
    const session = await getSession();
    authToken = session?.accessToken as string | undefined; // Assuming you add accessToken to your session/JWT
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...customConfig,
  };

  if (authToken) {
    (
      config.headers as Record<string, string>
    ).Authorization = `Bearer ${authToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const error = new Error(
      errorData.error || errorData.message || "An unknown error occurred"
    );
    Object.assign(error, { status: response.status, data: errorData });
    throw error;
  }

  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(
    endpoint: string,
    body: JsonBody,
    options?: ApiClientOptions // Update body type here
  ) => apiClient<T>(endpoint, { ...options, method: "POST", body }),
  patch: <T>(
    endpoint: string,
    body: JsonBody,
    options?: ApiClientOptions // Update body type here
  ) => apiClient<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
