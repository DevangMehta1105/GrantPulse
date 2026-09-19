// Semantic Vector Embedding & Cosine Similarity Engine

// Expanded domain thematic dictionary for Indian grant ecosystem
const THEMATIC_VOCABULARY: string[] = [
  "solar", "renewable", "energy", "ev", "electric", "battery", "cleantech", "climate", "carbon", "green",
  "manufacturing", "industrial", "zed", "zero defect", "quality", "lean", "hardware", "machinery",
  "healthcare", "medical", "maternal", "sanitation", "water", "wash", "filtration", "hospital", "clinic",
  "rural", "livelihood", "agriculture", "farming", "agritech", "irrigation", "fpo", "soil", "crop",
  "biotechnology", "medtech", "diagnostics", "lifesciences", "therapeutics", "laboratory", "clinical",
  "stem", "education", "digital", "literacy", "schools", "training", "skilling", "youth", "classrooms",
  "startup", "deeptech", "prototype", "commercialization", "seed", "proof of concept", "incubation",
  "women", "sc", "st", "greenfield", "handicrafts", "weavers", "artisan", "cluster", "credit", "collateral"
];

/**
 * Tokenizes and creates a normalized term-frequency vector across the thematic vocabulary
 */
export function generateThematicEmbedding(text: string): number[] {
  const clean = (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter(t => t.length > 2);
  const tokenCounts: Record<string, number> = {};

  tokens.forEach(t => {
    tokenCounts[t] = (tokenCounts[t] || 0) + 1;
  });

  // Calculate term weights over the vocabulary
  const vector: number[] = [];
  let sumSquares = 0;

  THEMATIC_VOCABULARY.forEach(term => {
    // Check direct word count or substring inclusion
    let count = tokenCounts[term] || 0;
    if (count === 0 && clean.includes(term)) {
      count = 0.5;
    }
    vector.push(count);
    sumSquares += count * count;
  });

  // Normalize vector to unit length (L2 norm)
  const magnitude = Math.sqrt(sumSquares);
  if (magnitude === 0) {
    return vector.map(() => 0);
  }

  return vector.map(v => v / magnitude);
}

/**
 * Computes cosine similarity between two unit vectors: dot(v1, v2)
 * Returns a value between 0.0 and 1.0 (converted to percentage 0 - 100)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Clip between 0 and 1
  const sim = Math.max(0, Math.min(1, dotProduct));
  return Math.round(sim * 100);
}

/**
 * Extracts key overlapping thematic keywords between two texts
 */
export function extractThematicOverlap(textA: string, textB: string): string[] {
  const cleanA = textA.toLowerCase();
  const cleanB = textB.toLowerCase();

  const overlapping: string[] = [];

  THEMATIC_VOCABULARY.forEach(term => {
    if (cleanA.includes(term) && cleanB.includes(term)) {
      overlapping.push(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  return Array.from(new Set(overlapping)).slice(0, 5);
}
