const CREDIT_REASON_SEPARATOR = " | ";

export const buildCreditReason = (
  reason: string,
  projectName?: string | null
) => {
  const trimmedProject = projectName?.trim();
  if (!trimmedProject) return reason;
  return `${reason}${CREDIT_REASON_SEPARATOR}${trimmedProject}`;
};

export const splitCreditReason = (reason?: string | null) => {
  if (!reason) {
    return { baseReason: "", projectName: null };
  }
  const separatorIndex = reason.indexOf(CREDIT_REASON_SEPARATOR);
  if (separatorIndex === -1) {
    return { baseReason: reason, projectName: null };
  }
  const baseReason = reason.slice(0, separatorIndex).trim();
  const projectName = reason
    .slice(separatorIndex + CREDIT_REASON_SEPARATOR.length)
    .trim();
  return {
    baseReason,
    projectName: projectName || null,
  };
};
