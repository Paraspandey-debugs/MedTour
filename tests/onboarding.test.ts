import { describe, expect, it } from "vitest";
import { MEDICAL_HUBS } from "@/components/Globe";
import { GLOBAL_ORIGINS, ORIGIN_LOCATIONS } from "@/app/onboarding/OnboardingWizard";
import { HOMES, HomeId } from "@/lib/data";

describe("Flexible Patient Onboarding & Global Origin Routing", () => {
  it("provides extensive global origin locations across all continents with valid coordinates", () => {
    expect(GLOBAL_ORIGINS.length).toBeGreaterThanOrEqual(30);

    for (const loc of GLOBAL_ORIGINS) {
      expect(loc.name).toBeTruthy();
      expect(loc.flag).toBeTruthy();
      expect(loc.phoneCode).toMatch(/^\+\d+/);
      expect(loc.lat).toBeGreaterThanOrEqual(-90);
      expect(loc.lat).toBeLessThanOrEqual(90);
      expect(loc.lng).toBeGreaterThanOrEqual(-180);
      expect(loc.lng).toBeLessThanOrEqual(180);
    }
  });

  it("maintains backward compatibility with ORIGIN_LOCATIONS slice", () => {
    expect(ORIGIN_LOCATIONS.length).toBe(8);
    expect(ORIGIN_LOCATIONS[0].id).toBe("US");
    expect(ORIGIN_LOCATIONS[1].id).toBe("UK");
  });

  it("covers major international medical hubs for flight path rendering", () => {
    const hubIds = MEDICAL_HUBS.map((h) => h.id);
    expect(hubIds).toContain("bangkok");
    expect(hubIds).toContain("delhi");
    expect(hubIds).toContain("istanbul");
    expect(hubIds).toContain("seoul");
    expect(hubIds).toContain("singapore");

    for (const hub of MEDICAL_HUBS) {
      expect(hub.lat).toBeDefined();
      expect(hub.lng).toBeDefined();
      expect(hub.flag).toBeDefined();
    }
  });

  it("ensures primary origin countries map to HOMES data", () => {
    const coreKeys: HomeId[] = ["US", "UK", "CA", "AU", "AE", "NG"];
    for (const key of coreKeys) {
      expect(HOMES[key]).toBeDefined();
      expect(HOMES[key].flight).toBeDefined();
      expect(HOMES[key].hours).toBeDefined();
    }
  });
});
