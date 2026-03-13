import React from "react";
import { Routes, Route } from "react-router-dom";
import { User } from "../types";

// Import themes
import * as DefaultTheme from "./default/Home";
import * as DefaultElementPage from "./default/ElementPage";

interface ThemeComponents {
  Home: React.ComponentType<any>;
  ElementPage: React.ComponentType<any>;
}

const THEME_REGISTRY: Record<string, ThemeComponents> = {
  default: {
    Home: DefaultTheme.Home,
    ElementPage: DefaultElementPage.ElementPage,
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
  const activeThemeName = settings.active_theme || "default";
  const theme = THEME_REGISTRY[activeThemeName] || THEME_REGISTRY.default;

  const { Home, ElementPage } = theme;

  return (
    <Routes>
      <Route path="/" element={<Home currentUser={currentUser} onLogout={onLogout} />} />
      <Route path="/e/:slug" element={<ElementPage currentUser={currentUser} onLogout={onLogout} />} />
      <Route path="*" element={<Home currentUser={currentUser} onLogout={onLogout} />} />
    </Routes>
  );
};
