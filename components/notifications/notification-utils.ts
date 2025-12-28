const FALLBACK_REASON = "Activity update";

export const formatNotificationReason = (reason?: string | null) => {
  if (!reason) return FALLBACK_REASON;
  const normalized = reason
    .replace(/[_:.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return FALLBACK_REASON;
  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const formatCreditsDelta = (amount: number) => {
  const formatted = Math.abs(amount).toLocaleString("en-US");
  return amount < 0 ? `-${formatted} credits` : `+${formatted} credits`;
};

