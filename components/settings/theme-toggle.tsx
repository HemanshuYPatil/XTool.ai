"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentTheme =
    theme === "system" ? resolvedTheme ?? "dark" : theme ?? "dark";

  return (
    <div className="flex bg-muted rounded-full p-1">
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition ${
          mounted && currentTheme === "dark"
            ? "bg-background shadow-sm"
            : "text-muted-foreground"
        }`}
        aria-pressed={mounted && currentTheme === "dark"}
        onClick={() => setTheme("dark")}
        disabled={!mounted}
      >
        <MoonIcon className="size-3.5" />
        Dark
      </button>
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition ${
          mounted && currentTheme === "light"
            ? "bg-background shadow-sm"
            : "text-muted-foreground"
        }`}
        aria-pressed={mounted && currentTheme === "light"}
        onClick={() => setTheme("light")}
        disabled={!mounted}
      >
        <SunIcon className="size-3.5" />
        Light
      </button>
    </div>
  );
};

export default ThemeToggle;
