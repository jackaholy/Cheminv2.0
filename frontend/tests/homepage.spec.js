import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await expect(page.locator("#root")).toMatchAriaSnapshot(
    `
    - navigation:
      - link "Chemical Inventory"
      - list:
        - listitem:
          - link "Safety Datasheets"
      - list:
        - listitem:
          - button "Hi Anne Admin"
    - textbox "Search..."
    - button "search"
    - heading "Room Location" [level=2]:
      - button "Room Location" [expanded]
    - textbox "Filter rooms"
    - radio "Any"
    - text: Any
    - heading "Manufacturers" [level=2]:
      - button "Manufacturers" [expanded]
    - textbox "Filter manufacturers"
    - checkbox "Avantor Performance Materials"
    - text: Avantor Performance Materials
    - checkbox "BDB"
    - text: BDB
    - checkbox "Fisher Scientific"
    - text: Fisher Scientific
    - checkbox "Honeywell"
    - text: Honeywell
    - checkbox "Merck"
    - text: Merck
    - checkbox "Sigma-Aldrich"
    - text: Sigma-Aldrich
    - checkbox "VWR International"
    - text: VWR International Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Ammonia"
    - text: NH3
    - button "Edit":
      - img: 
    - text: "1"
    - button "Copper(II) Sulfate"
    - text: CuSO4
    - button "Edit":
      - img: 
    - text: "1"
    - button "Ethanol"
    - text: C2H6O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Methanol"
    - text: CH4O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Potassium Nitrate"
    - text: KNO3
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sodium Hydroxide"
    - text: NaOH
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sulfuric Acid"
    - text: H2SO4
    - button "Edit":
      - img: 
    - text: "1"
    - button "Water"
    - text: H2O
    - button "Edit":
      - img: 
    - text: "0"
    - button "Hydrochloric Acid"
    - text: HCl
    - button "Edit":
      - img: 
    - text: "0"
    - button "Silver Nitrate"
    - text: AgNO3
    - button "Edit":
      - img: 
  `
  );

});
