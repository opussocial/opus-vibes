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
import * as MagazineTheme from "./magazine/Home";
import * as MagazineElementPage from "./magazine/ElementPage";
import * as HostelTheme from "./hostel/Home";
import * as HostelElementPage from "./hostel/ElementPage";

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
  },
  magazine: {
    Home: MagazineTheme.Home,
    ElementPage: MagazineElementPage.ElementPage,
  },
  hostel: {
    Home: HostelTheme.Home,
    ElementPage: HostelElementPage.ElementPage,
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
  const activeThemeName = settings.active_theme || "hostel";
  const theme = THEME_REGISTRY[activeThemeName] || THEME_REGISTRY.hostel;

  const { Home, ElementPage } = theme;

  return (
    <div className="theme-ui">
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} onLogout={onLogout} />} />
        <Route path="/e/:slug" element={<ElementPage currentUser={currentUser} onLogout={onLogout} />} />
        <Route path="*" element={<Home currentUser={currentUser} onLogout={onLogout} />} />
      </Routes>
    </div>
  );
};
