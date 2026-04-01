import React from "react";
import { Routes, Route } from "react-router-dom";
import { User } from "../types";

// Import themes
import * as FullThemeHome from "./themes/full-theme/Home";
import * as FullThemeElementPage from "./themes/full-theme/ElementPage";
import * as MinimalThemeHome from "./themes/minimal-theme/Home";
import * as MinimalThemeElementPage from "./themes/minimal-theme/ElementPage";
import { Portal } from "./Portal";

interface ThemeComponents {
  Home: React.ComponentType<any>;
  ElementPage: React.ComponentType<any>;
  Explore?: React.ComponentType<any>;
}

const THEME_REGISTRY: Record<string, ThemeComponents> = {
  "full-theme": {
    Home: FullThemeHome.Home,
    ElementPage: FullThemeElementPage.ElementPage,
  },
  "minimal-theme": {
    Home: MinimalThemeHome.Home,
    ElementPage: MinimalThemeElementPage.ElementPage,
  }
};

export const ThemeEngine = ({ 
  currentUser, 
  onLogout, 
  settings 
}: { 
  currentUser: User | null, 
  onLogout: () => void,
  settings: Record<string, any>
}) => {
  const themeParam = new URLSearchParams(window.location.search).get("theme");
  const activeThemeName = themeParam || settings.active_theme || "full-theme";
  const theme = THEME_REGISTRY[activeThemeName] || THEME_REGISTRY["full-theme"];

  const { Home, ElementPage, Explore } = theme as any;

  return (
    <div className="theme-ui">
      <Routes>
        <Route path="/" element={themeParam ? <Home currentUser={currentUser} onLogout={onLogout} settings={settings} /> : <Portal currentUser={currentUser} />} />
        <Route path="/home" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="/explore" element={Explore ? <Explore currentUser={currentUser} onLogout={onLogout} settings={settings} /> : <Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="/e/:slug" element={<ElementPage currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="*" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
      </Routes>
    </div>
  );
};
