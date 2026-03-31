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
import * as HostelExplore from "./hostel/Explore";
import * as HostelMagazineTheme from "./hostel-magazine/Home";
import * as HostelMagazineElementPage from "./hostel-magazine/ElementPage";
import * as BootstrapBarebonesHome from "./bootstrap-barebones/Home";
import * as BootstrapBarebonesElementPage from "./bootstrap-barebones/ElementPage";
import * as BootstrapBarebonesExplore from "./bootstrap-barebones/Explore";
import * as BrutalistHome from "./brutalist/Home";
import * as BrutalistElementPage from "./brutalist/ElementPage";
import { Portal } from "./Portal";

interface ThemeComponents {
  Home: React.ComponentType<any>;
  ElementPage: React.ComponentType<any>;
  Explore?: React.ComponentType<any>;
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
    Explore: HostelExplore.Explore,
  },
  "hostel-magazine": {
    Home: HostelMagazineTheme.Home,
    ElementPage: HostelMagazineElementPage.ElementPage,
  },
  "bootstrap-barebones": {
    Home: BootstrapBarebonesHome.Home,
    ElementPage: BootstrapBarebonesElementPage.ElementPage,
    Explore: BootstrapBarebonesExplore.Explore,
  },
  brutalist: {
    Home: BrutalistHome.Home,
    ElementPage: BrutalistElementPage.ElementPage,
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
  const activeThemeName = themeParam || settings.active_theme || "hostel-magazine";
  const theme = THEME_REGISTRY[activeThemeName] || THEME_REGISTRY["hostel-magazine"];

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
