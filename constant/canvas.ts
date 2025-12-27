export const TOOL_MODE_ENUM = {
  SELECT: "SELECT",
  HAND: "HAND",
  EDIT: "EDIT",
} as const;

export type ToolModeType = keyof typeof TOOL_MODE_ENUM;
