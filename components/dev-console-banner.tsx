"use client";

import { useEffect } from "react";

const TITLE_STYLE =
  "font-size:36px;font-weight:800;letter-spacing:1px;color:#f97316;text-shadow:0 2px 18px rgba(249,115,22,0.4);";
const SUB_STYLE =
  "font-size:14px;font-weight:600;color:#0ea5e9;letter-spacing:0.8px;";
const NOTE_STYLE =
  "font-size:12px;font-weight:500;color:#94a3b8;";

export const DevConsoleBanner = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.info("%cXTool.AI Developer Console", TITLE_STYLE);
    console.info("%cBuild clean UI. Ship bold ideas. Iterate fast.", SUB_STYLE);
    console.info(
      "%cTip: Review network + Convex logs when realtime data looks stale.",
      NOTE_STYLE
    );
  }, []);

  return null;
};
