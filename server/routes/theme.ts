import express from "express";
import { themeService } from "../services/ThemeService";
import { featureService } from "../services/FeatureService";
import { db } from "../db";

const router = express.Router();

router.get("/theme/home", async (req, res) => {
  try {
    const enableHomepage = featureService.isFeatureEnabled("enable_homepage");
    
    if (!enableHomepage) {
      // Check for home_element setting
      const setting = db.prepare("SELECT value FROM settings WHERE key = 'home_element' AND type_id IS NULL AND user_id IS NULL").get() as { value: string } | undefined;
      
      if (setting) {
        const slug = JSON.parse(setting.value);
        const element = await themeService.getElementBySlug(slug);
        if (element) {
          return res.json({ type: "element", data: element });
        }
      }
      return res.status(404).json({ error: "Homepage disabled and no home_element found" });
    }

    // Default homepage data (could be a list of featured elements or just a flag)
    res.json({ type: "default", message: "Default homepage enabled" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/theme/element/:slug", async (req, res) => {
  try {
    const element = await themeService.getElementBySlug(req.params.slug);
    if (!element) return res.status(404).json({ error: "Element not found" });
    
    // Also fetch children and related elements for convenience in templates
    const children = await themeService.getChildren(element.id);
    const related = await themeService.getRelatedElements(element.id);
    
    res.json({ 
      element,
      children,
      related
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for the new frontend structure
router.get("/theme/element/:type/:id", async (req, res) => {
  try {
    const element = await themeService.getElementBySlug(req.params.id);
    if (!element) return res.status(404).json({ error: "Element not found" });
    
    const children = await themeService.getChildren(element.id);
    const related = await themeService.getRelatedElements(element.id);
    
    res.json({ 
      element,
      children,
      related
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
