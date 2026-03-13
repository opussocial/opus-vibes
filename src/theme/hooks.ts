import { useState, useEffect } from "react";
import { Element, ElementDetail } from "../types";
import { themeUtils } from "./utils";

export const useTheme = () => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        const [fRes, sRes] = await Promise.all([
          fetch("/api/features"),
          fetch("/api/settings")
        ]);
        setFeatures(await fRes.json());
        setSettings(await sRes.json());
      } catch (err) {
        console.error("Error fetching theme config", err);
      } finally {
        setLoading(false);
      }
    };
    fetchThemeConfig();
  }, []);

  return {
    features,
    settings,
    loading,
    ...themeUtils
  };
};
