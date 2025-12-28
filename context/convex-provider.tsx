"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { ReactNode, useCallback, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

const useConvexAuth = () => {
  const {
    user,
    isLoading,
    accessTokenRaw,
    idTokenRaw,
    getToken: getKindeToken,
    getAccessTokenRaw,
    getIdTokenRaw,
  } = useKindeBrowserClient();

  const getToken = useCallback(async () => {
    if (getAccessTokenRaw) {
      const token = (await getAccessTokenRaw()) ?? accessTokenRaw ?? null;
      if (token) return { token, source: "access" as const };
    }
    if (getKindeToken) {
      const token = (await getKindeToken()) ?? accessTokenRaw ?? null;
      if (token) return { token, source: "access" as const };
    }
    const token = accessTokenRaw ?? null;
    return token ? { token, source: "access" as const } : null;
  }, [accessTokenRaw, getAccessTokenRaw, getKindeToken]);

  const getFallbackToken = useCallback(async () => {
    if (getIdTokenRaw) {
      const token = (await getIdTokenRaw()) ?? idTokenRaw ?? null;
      if (token) return { token, source: "id" as const };
    }
    const token = idTokenRaw ?? null;
    return token ? { token, source: "id" as const } : null;
  }, [getIdTokenRaw, idTokenRaw]);

  const fetchAccessToken = useCallback(
    async (_args: { forceRefreshToken: boolean }) => {
      try {
        const access = await getToken();
        const id = await getFallbackToken();
        const accessPayload = access?.token
          ? decodeJwtPayload(access.token)
          : null;
        const idPayload = id?.token ? decodeJwtPayload(id.token) : null;
        const hasAccessAudience = hasAudience(accessPayload);
        const resolved =
          access && hasAccessAudience ? access : id ?? access ?? null;
        const token = resolved?.token ?? null;
        return token;
      } catch (error) {
        console.error("ConvexProvider: fetchAccessToken error", error);
        return null;
      }
    },
    [getFallbackToken, getToken]
  );

  return useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading: Boolean(isLoading),
      fetchAccessToken,
    }),
    [fetchAccessToken, isLoading, user]
  );
};

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as {
      iss?: string;
      aud?: string | string[];
      sub?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
};

const hasAudience = (payload: {
  aud?: string | string[];
} | null) => {
  if (!payload?.aud) return false;
  return Array.isArray(payload.aud) ? payload.aud.length > 0 : Boolean(payload.aud);
};

export const ConvexProvider = ({ children }: { children: ReactNode }) => {
  if (!convexClient) {
    console.error("ConvexProvider: NEXT_PUBLIC_CONVEX_URL is not configured.");
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }

  return (
    <ConvexProviderWithAuth client={convexClient} useAuth={useConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
};
