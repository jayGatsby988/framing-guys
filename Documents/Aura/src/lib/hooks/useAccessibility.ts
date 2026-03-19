"use client";

import { useState, useEffect, useCallback } from "react";

type ContrastMode = "normal" | "high" | "max";

interface AccessibilitySettings {
  fontSize: number; // 1-3
  contrast: ContrastMode;
  lineSpacing: number; // 1-2 (multiplier)
  reducedMotion: boolean;
  screenReader: boolean;
}

interface AccessibilityHook extends AccessibilitySettings {
  setFontSize: (size: number) => void;
  setContrast: (contrast: ContrastMode) => void;
  setLineSpacing: (spacing: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  setScreenReader: (enabled: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 1,
  contrast: "normal",
  lineSpacing: 1.5,
  reducedMotion: false,
  screenReader: false,
};

const STORAGE_KEY = "aura-accessibility-settings";

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;

  // Font size scale
  const fontScales = [1, 1.125, 1.25];
  const scale = fontScales[settings.fontSize - 1] || 1;
  root.style.setProperty("--accessibility-font-scale", String(scale));
  root.style.fontSize = `${scale * 16}px`;

  // Contrast
  if (settings.contrast === "max") {
    root.style.setProperty("--text-primary", "#FFFFFF");
    root.style.setProperty("--text-secondary", "#E0E0E0");
    root.style.setProperty("--bg-base", "#000000");
    root.style.setProperty("--bg-surface", "#0A0A0A");
  } else if (settings.contrast === "high") {
    root.style.setProperty("--text-primary", "#FAFAFA");
    root.style.setProperty("--text-secondary", "#D0D0D8");
    root.style.setProperty("--bg-base", "#050507");
    root.style.setProperty("--bg-surface", "#0C0C0F");
  } else {
    root.style.removeProperty("--text-primary");
    root.style.removeProperty("--text-secondary");
    root.style.removeProperty("--bg-base");
    root.style.removeProperty("--bg-surface");
  }

  // Line spacing
  root.style.setProperty("--accessibility-line-spacing", String(settings.lineSpacing));
  root.style.lineHeight = String(settings.lineSpacing);

  // Reduced motion
  if (settings.reducedMotion) {
    root.style.setProperty("--accessibility-motion", "reduce");
  } else {
    root.style.removeProperty("--accessibility-motion");
  }
}

export function useAccessibility(): AccessibilityHook {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const setFontSize = useCallback((size: number) => {
    setSettings((prev) => ({ ...prev, fontSize: Math.min(3, Math.max(1, size)) }));
  }, []);

  const setContrast = useCallback((contrast: ContrastMode) => {
    setSettings((prev) => ({ ...prev, contrast }));
  }, []);

  const setLineSpacing = useCallback((spacing: number) => {
    setSettings((prev) => ({ ...prev, lineSpacing: spacing }));
  }, []);

  const setReducedMotion = useCallback((reduced: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: reduced }));
  }, []);

  const setScreenReader = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, screenReader: enabled }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    ...settings,
    setFontSize,
    setContrast,
    setLineSpacing,
    setReducedMotion,
    setScreenReader,
    resetSettings,
  };
}
