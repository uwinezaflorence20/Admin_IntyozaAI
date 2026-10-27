"use client";

import { useEffect, useState } from "react";
import { TbMoon, TbSun } from "react-icons/tb";

const STORAGE_KEY = "intyoza.theme";

function currentTheme() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Light/dark switch, same behaviour as the Intyoza web app: follows the device until a choice is made. */
export function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setTheme(currentTheme()), 0);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  };

  const dark = theme === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {dark ? <TbSun size={18} /> : <TbMoon size={18} />}
    </button>
  );
}
