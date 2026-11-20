import { describe, expect, it } from "vitest";
import {
  DESTINATION_GUIDES,
  getDestinationByCountry,
  getDestinationById,
  calculateConvalescenceBudget,
} from "@/lib/tourism";
import { HOSPITALS } from "@/lib/data";

describe("Medical Tourism & Convalescence Guides", () => {
  it("provides comprehensive destination guides for all 8 core partner countries", () => {
    const requiredCountries = ["TH", "IN", "TR", "KR", "MY", "AE", "MX", "SG"];
    const coveredCountries = DESTINATION_GUIDES.map((d) => d.countryId);

    for (const c of requiredCountries) {
      expect(coveredCountries).toContain(c);
    }
  });

  it("ensures every hospital maps to an active destination guide", () => {
    for (const hospital of HOSPITALS) {
      const dest = getDestinationByCountry(hospital.country);
      expect(dest).toBeDefined();
      expect(dest?.city).toBeDefined();
      expect(dest?.visa.processingDays).toBeGreaterThan(0);
      expect(dest?.recoveryHotels.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("contains rich convalescent hotel options with required amenities", () => {
    for (const dest of DESTINATION_GUIDES) {
      expect(dest.recoveryHotels.length).toBeGreaterThanOrEqual(2);
      for (const hotel of dest.recoveryHotels) {
        expect(hotel.name).toBeTruthy();
        expect(hotel.pricePerNight).toBeGreaterThan(0);
        expect(hotel.amenities.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("provides a structured 5-day companion itinerary for every destination", () => {
    for (const dest of DESTINATION_GUIDES) {
      expect(dest.companionItinerary.length).toBe(5);
      const days = dest.companionItinerary.map((p) => p.day);
      expect(days).toEqual([1, 2, 3, 4, 5]);

      for (const day of dest.companionItinerary) {
        expect(day.phase).toBeTruthy();
        expect(day.title).toBeTruthy();
        expect(day.activity).toBeTruthy();
        expect(day.tip).toBeTruthy();
      }
    }
  });

  it("calculates realistic convalescence budgets dynamically", () => {
    const soloBudget = calculateConvalescenceBudget({
      destinationId: "bangkok",
      recoveryDays: 7,
      companion: false,
      selectedHotelIndex: 0,
    });

    const companionBudget = calculateConvalescenceBudget({
      destinationId: "bangkok",
      recoveryDays: 7,
      companion: true,
      selectedHotelIndex: 0,
    });

    expect(soloBudget.total).toBeGreaterThan(0);
    expect(companionBudget.total).toBeGreaterThan(soloBudget.total);
    // Companion budget includes companion daily food and additional attendant visa fee
    expect(companionBudget.companionDailyFood).toBe(45 * 7);
    expect(soloBudget.companionDailyFood).toBe(0);
  });

  it("resolves destinations by ID or country code safely", () => {
    expect(getDestinationById("bangkok")?.city).toBe("Bangkok");
    expect(getDestinationById("TH")?.city).toBe("Bangkok");
    expect(getDestinationById("nonexistent")).toBeUndefined();
  });
});
