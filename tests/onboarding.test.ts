import { describe, expect, it } from "vitest";
import { MEDICAL_HUBS } from "@/components/Globe";
import { ORIGIN_LOCATIONS } from "@/app/onboarding/OnboardingWizard";
import { HOMES, HomeId } from "@/lib/data";

describe("Patient Onboarding & Globe Routing", () => {
  it("provides comprehensive origin locations with valid geographic coordinates", () => {
    expect(ORIGIN_LOCATIONS.length).toBeGreaterThanOrEqual(6);

    for (const loc of ORIGIN_LOCATIONS) {
      expect(loc.name).toBeTruthy();
      expect(loc.flag).toBeTruthy();
      expect(loc.lat).toBeGreaterThanOrEqual(-90);
      expect(loc.lat).toBeLessThanOrEqual(90);
      expect(loc.lng).toBeGreaterThanOrEqual(-180);
      expect(loc.lng).toBeLessThanOrEqual(180);
    }
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
