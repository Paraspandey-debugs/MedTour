import type { MetadataRoute } from "next";
import { HOSPITALS } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/hospitals", "/match", "/cost", "/journey", "/security", "/loyalty", "/partners", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...HOSPITALS.map((h) => ({ url: `${BASE}/hospitals/${h.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
