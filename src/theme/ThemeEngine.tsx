import React from "react";
import { Routes, Route } from "react-router-dom";
import { User } from "../types";

// Import themes
import * as DefaultTheme from "./default/Home";
import * as DefaultElementPage from "./default/ElementPage";
import * as TailwindTheme from "./tailwind/Home";
import * as TailwindElementPage from "./tailwind/ElementPage";
import * as BootstrapTheme from "./bootstrap/Home";
import * as BootstrapElementPage from "./bootstrap/ElementPage";

interface ThemeComponents {
  Home: React.ComponentType<any>;
  ElementPage: React.ComponentType<any>;
}

const THEME_REGISTRY: Record<string, ThemeComponents> = {
  default: {
    Home: DefaultTheme.Home,
    ElementPage: DefaultElementPage.ElementPage,
  },
  tailwind: {
    Home: TailwindTheme.Home,
    ElementPage: TailwindElementPage.ElementPage,
  },
  bootstrap: {
    Home: BootstrapTheme.Home,
    ElementPage: BootstrapElementPage.ElementPage,
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
