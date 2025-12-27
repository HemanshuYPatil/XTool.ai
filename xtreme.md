# Xterme Plan Implementation Flow

Goal: add a future "XTERME" plan with advanced UI and generation capabilities.

1) Define plan constants and billing mapping
- Update the Prisma enum in `prisma/schema.prisma` to include `XTERME`.
- Regenerate Prisma client.
- Extend `lib/billing.ts` to map Polar product/price IDs to `Plan.XTERME`.
- Add env vars for the new Polar product/price IDs.

2) Surface plan data to the UI
- Ensure API responses include `plan` for authenticated users.
- Extend project routes to expose `plan` on project detail responses (already done for PRO).
- Add a lightweight `/api/account` (or reuse existing server loaders) to return the plan for landing modules.

3) Gate premium UI/UX in the XDesign module
- Add plan-aware UI sections in `app/(routes)/_common/landing-section.tsx`.
- Show PRO-only advanced controls now, and XTERME-only controls later.
- Use `plan === "XTERME"` to unlock the most advanced layout tools.

4) Upgrade project workspace UI for XTERME
- Add a dedicated XTERME "Studio" stripe in `app/(routes)/project/[id]/_common/header.tsx`.
- Add advanced control clusters in the canvas toolbar for XTERME users.
- Keep functionality read-only if the feature is not ready; mark as "Preview".

5) Enforce generation limits and capabilities
- Update `app/api/project/route.ts` and `app/api/project/[id]/route.ts` to apply XTERME limits (e.g., more frames per project, higher output quality).
- Add XTERME-only theme access in `lib/themes.ts`.
- Update prompt rules in `lib/prompt.ts` to add XTERME-specific guidance.

6) Add export and collaboration perks
- Unlock higher resolution exports and extra formats for XTERME in `app/api/screenshot/route.ts`.
- Expand share/engagement tools (review links, snapshots) for XTERME in project drawers.

7) UI copy and pricing updates
- Add XTERME plan card to `app/(routes)/pricing/page.tsx` and `components/landing/pricing.tsx`.
- Update account/billing pages to show XTERME status, renewal, and seats.

8) QA checklist
- Verify plan upgrades/downgrades update UI and API responses.
- Validate UI gating across XDesign landing, project header, and canvas tools.
- Confirm API limits for FREE/PRO/XTERME are enforced.
