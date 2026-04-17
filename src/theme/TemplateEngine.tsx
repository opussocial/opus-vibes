import React from "react";
import { Routes, Route } from "react-router-dom";
import { User } from "../types";

// Import core templates
import { Home } from "./Home";
import { ElementPage } from "./ElementPage";

export const TemplateEngine = ({ 
  currentUser, 
  onLogout, 
  settings 
}: { 
  currentUser: User | null, 
  onLogout: () => void,
  settings: Record<string, any>
}) => {
  return (
    <div className="template-system">
      <Routes>
        {/* Core Template Routes */}
        <Route path="/" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="/home" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="/explore" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        
        {/* Element Templates (Structured and Slug-based) */}
        <Route path="/element/:type/:id" element={<ElementPage currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        <Route path="/e/:slug" element={<ElementPage currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
        
        {/* Fallback */}
        <Route path="*" element={<Home currentUser={currentUser} onLogout={onLogout} settings={settings} />} />
      </Routes>
    </div>
  );
};
