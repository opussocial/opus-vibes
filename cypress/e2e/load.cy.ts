describe("App Loading", () => {
  it("should load the app and show the loading screen then the dashboard or auth screen", () => {
    cy.visit("/");
    
    // Check if loading screen appears
    cy.get("p").contains("Loading FlexCatalog...").should("be.visible");
    
    // Wait for loading to finish (increase timeout if needed)
    cy.get("p").contains("Loading FlexCatalog...", { timeout: 15000 }).should("not.exist");
    
    // Check if we are on AuthScreen or Dashboard
    cy.get("body").then(($body) => {
      if ($body.find("h1").text().includes("FlexCatalog")) {
        // We are on Dashboard or AuthScreen
        cy.log("App loaded successfully");
      } else {
        throw new Error("App failed to load correctly");
      }
    });
  });
});
