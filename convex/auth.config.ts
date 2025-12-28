import type { AuthConfig } from "convex/server";

const kindeIssuer = process.env.CONVEX_KINDE_ISSUER_URL;
const kindeAudience = process.env.CONVEX_KINDE_AUDIENCE;

if (!kindeIssuer || !kindeAudience) {
  throw new Error(
    "Missing CONVEX_KINDE_ISSUER_URL or CONVEX_KINDE_AUDIENCE for Convex auth."
  );
}

export default {
  providers: [
    {
      domain: kindeIssuer,
      applicationID: kindeAudience,
    },
  ],
} satisfies AuthConfig;
