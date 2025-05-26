// utils/auth.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub?: string; // NextAuth default user ID claim
  userId?: string; // our custom claim we set in jwt()
  role?: string; // our custom claim
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Read and decode the NextAuth session JWT from the cookie.
 */
export function getUserFromToken(): TokenPayload | null {
  // NextAuth stores the session JWT here:
  const token =
    Cookies.get("__Secure-next-auth.session-token") ||
    Cookies.get("next-auth.session-token") ||
    null;

  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (err) {
    console.error("Failed to decode session token:", err);
    return null;
  }
}

/**
 * Return the user ID, preferring our `userId` claim, fallback to `sub`.
 */
export function getUserId(): string | null {
  const payload = getUserFromToken();
  return payload?.userId ?? payload?.sub ?? null;
}

/**
 * Return the user role from the token.
 */
export function getUserRole(): string | null {
  const payload = getUserFromToken();
  return payload?.role ?? null;
}
