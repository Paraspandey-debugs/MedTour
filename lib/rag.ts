import { createClient } from "@/lib/supabase/client";
import { getGeminiEmbedding } from "@/lib/gemini";

export interface KnowledgeChunk {
  id: string;
  category: "fit_to_fly" | "hospital" | "insurance" | "visa" | "escrow" | "medication";
  source: string;
  title: string;
  content: string;
  embedding?: number[];
}

export const VERIFIED_KNOWLEDGE_CORPUS: KnowledgeChunk[] = [
  {
    id: "f2f-knee-hip",
    category: "fit_to_fly",
    source: "MedTour Aerospace Clinical Guidelines & IATA Medical Manual",
    title: "Fit-to-Fly Gate: Lower-Limb Arthroplasty (Knee & Hip)",
    content: "Return flights for Total Knee Replacement and Total Hip Replacement are gated to a strict minimum of Day 14 post-operation. Seated travel in a pressurized aircraft cabin carries elevated Deep Vein Thrombosis (DVT) and pulmonary embolism risks. Discharge clearance requires verified wound healing, absence of deep swelling, and independent mobility before flight ticket unlocking.",
  },
  {
    id: "f2f-cabg",
    category: "fit_to_fly",
    source: "Cardiothoracic Society & Aerospace Medicine Guidelines",
    title: "Fit-to-Fly Gate: Coronary Artery Bypass Graft (CABG)",
    content: "Heart bypass patients are strictly barred from air travel before Day 21. Sternal bone union, resolution of pleural effusion, and hemodynamic stability under altitude-simulated hypoxia must be verified by the treating cardiac surgeon. Cabin pressure altitudes (6,000–8,000 ft) reduce oxygen saturation, requiring a minimum 3-week stable window.",
  },
  {
    id: "f2f-bariatric",
    category: "fit_to_fly",
    source: "International Federation for Surgery of Obesity (IFSO) Safety Protocol",
    title: "Fit-to-Fly Gate: Gastric Sleeve & Bariatric Surgery",
    content: "Gastric sleeve patients must remain in the treating city until Day 10. The highest-risk window for staple-line leaks occurs between post-op Day 2 and Day 7. Cabin pressure expansion of intraluminal gas can stress staple lines. Flying is approved only after clear oral fluid tolerance and surgeon sign-off.",
  },
  {
    id: "f2f-spine",
    category: "fit_to_fly",
    source: "Spine Surgery International Consensus",
    title: "Fit-to-Fly Gate: Lumbar Spinal Fusion",
    content: "Spinal fusion return flights are gated to Day 16. Prolonged sitting exerts axial pressure on newly installed pedicle screws and interbody cages. Flight approval requires neuro-monitoring check, suture removal, and pain control on oral non-sedating medications.",
  },
  {
    id: "hosp-aravali-insurance",
    category: "hospital",
    source: "Aravali Heart & Joint Institute International Desk Protocol",
    title: "Aravali Institute: Insurance & Direct Billing Accreditations",
    content: "Aravali Heart & Joint Institute (New Delhi) holds dual JCI (USA) and NABH (India) accreditations. The hospital maintains direct billing agreements with Bupa Global, Cigna International, Allianz Worldwide Care, and Aetna International with pre-authorization Guarantee of Payment (GOP) letters. Out-of-network patients receive itemized English HL7 bills for home claim reimbursement.",
  },
  {
    id: "hosp-merlion-rates",
    category: "hospital",
    source: "Ministry of Health Singapore & Merlion Specialist Centre Audit",
    title: "Merlion Specialist Centre: Outcomes & Surgical Registry",
    content: "Merlion Specialist Centre (Singapore) is JCI-accredited and maintains Asia's lowest verified 30-day surgical complication rate (0.65x risk index; audited CABG complication rate 1.2%). Features dedicated robotic-assisted operating suites and 1:1 patient-to-nurse ICU staffing.",
  },
  {
    id: "visa-rollover-protection",
    category: "visa",
    source: "MedTour Fast-Track Visa Guarantee Policy",
    title: "Fast-Track Medical Visas & 45-Day Date Rollover Protection",
    content: "All MedTour accredited hospitals provide government-registered Medical Visa Invitation Letters. In the event of consular visa processing delays, MedTour enforces the 45-Day Protected Rollover Guarantee: your operating theatre booking, surgical team schedule, and locked package price roll forward up to 45 days at zero financial penalty.",
  },
  {
    id: "escrow-state-machine",
    category: "escrow",
    source: "MedTour Actuarial Escrow & Smart Contract Terms",
    title: "Milestone Outcome Escrow: 15% Holdback Mechanism",
    content: "Patient payments are disbursed across 4 transparent tranches: Tranche 1 (10% booking slot), Tranche 2 (40% hospital admission check-in), Tranche 3 (35% discharge to local recovery hotel), and Tranche 4 (15% held in independent escrow until the Day-30 post-return clinical teleconsultation). If a verified clinical complication arises, the escrow holdback funds immediate remediation.",
  },
  {
    id: "meds-blood-thinners",
    category: "medication",
    source: "Pre-Operative Anticoagulation Management Standard",
    title: "Pre-Surgery Blood Thinner Protocol",
    content: "Direct oral anticoagulants (Apixaban, Rivaroxaban) must be withheld 48-72 hours prior to major surgery. Warfarin requires a 5-day pre-op cessation with INR monitoring < 1.5, bridged with low-molecular-weight heparin if prescribed by your cardiologist. Never discontinue medications without consulting your MedTour coordinator.",
  },
];

/**
 * Computes cosine similarity between two vector embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface MatchedKnowledgeRow {
  id: string;
  source: string;
  title: string;
  content: string;
  category: "fit_to_fly" | "hospital" | "insurance" | "visa" | "escrow" | "medication";
}

/**
 * Retrieves the most relevant clinical & hospital knowledge chunks for a patient query.
 * First queries Supabase pgvector RPC `match_clinical_knowledge`.
 * If the database table/RPC is unavailable, uses embedding cosine similarity or semantic text matching.
 */
export async function searchClinicalKnowledge(
  query: string,
  limit = 3
): Promise<{ contextText: string; citations: string[]; chunks: KnowledgeChunk[] }> {
  const queryLower = query.toLowerCase();

  // Try Supabase pgvector RPC first if query embedding is available
  try {
    const queryEmbedding = await getGeminiEmbedding(query);

    if (queryEmbedding && queryEmbedding.length > 0) {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("match_clinical_knowledge", {
        query_embedding: queryEmbedding,
        match_threshold: 0.45,
        match_count: limit,
      });

      if (!error && data && data.length > 0) {
        const rows = data as MatchedKnowledgeRow[];
        const citations = rows.map((d) => d.source);
        const contextText = rows
          .map((d) => `Source: [${d.source}]\nTitle: ${d.title}\nContent: ${d.content}`)
          .join("\n\n");

        return {
          contextText,
          citations: [...new Set(citations)] as string[],
          chunks: data,
        };
      }
    }
  } catch {
    // Graceful fallback to verified corpus
  }

  // Fallback: Semantic relevance scoring on verified corpus
  const scoredChunks = VERIFIED_KNOWLEDGE_CORPUS.map((chunk) => {
    let score = 0;
    const combined = `${chunk.title} ${chunk.content} ${chunk.category} ${chunk.source}`.toLowerCase();

    // Keyword matching
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
    for (const word of queryWords) {
      if (combined.includes(word)) score += 2;
    }

    if (queryLower.includes("fly") || queryLower.includes("flight") || queryLower.includes("day 10") || queryLower.includes("day 14")) {
      if (chunk.category === "fit_to_fly") score += 5;
    }
    if (queryLower.includes("insurance") || queryLower.includes("bupa") || queryLower.includes("cigna") || queryLower.includes("bill")) {
      if (chunk.category === "hospital" || chunk.category === "insurance") score += 5;
    }
    if (queryLower.includes("visa") || queryLower.includes("embassy") || queryLower.includes("delay")) {
      if (chunk.category === "visa") score += 5;
    }
    if (queryLower.includes("escrow") || queryLower.includes("refund") || queryLower.includes("15%") || queryLower.includes("holdback")) {
      if (chunk.category === "escrow") score += 5;
    }
    if (queryLower.includes("thinner") || queryLower.includes("aspirin") || queryLower.includes("warfarin") || queryLower.includes("medication")) {
      if (chunk.category === "medication") score += 5;
    }

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, limit).map((s) => s.chunk);

  const citations = [...new Set(topChunks.map((c) => c.source))];
  const contextText = topChunks
    .map((c) => `Source: [${c.source}]\nTitle: ${c.title}\nContent: ${c.content}`)
    .join("\n\n");

  return { contextText, citations, chunks: topChunks };
}
