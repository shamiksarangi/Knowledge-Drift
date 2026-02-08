/**
 * TF-IDF Cosine Similarity Engine
 * Lightweight vector similarity for ticket clustering and KB search
 * No external dependencies — pure TypeScript implementation
 */

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","in","on","at","to","for","of","and","or",
  "not","with","this","that","from","by","it","as","be","has","had","have","will",
  "can","may","i","my","we","our","you","your","been","being","more","than","about",
  "which","would","could","should","their","there","them","these","those","each",
  "all","both","other","such","only","then","just","because","but","so","if","while",
  "where","how","what","who","its","also","into","when","after","before","during",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function computeTF(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  tokens.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
  const max = Math.max(...freq.values(), 1);
  const tf = new Map<string, number>();
  freq.forEach((count, term) => tf.set(term, 0.5 + 0.5 * (count / max)));
  return tf;
}

function computeIDF(documents: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  const N = documents.length;
  documents.forEach(doc => {
    const unique = new Set(doc);
    unique.forEach(term => df.set(term, (df.get(term) || 0) + 1));
  });
  const idf = new Map<string, number>();
  df.forEach((count, term) => idf.set(term, Math.log((N + 1) / (count + 1)) + 1));
  return idf;
}

function tfidfVector(tf: Map<string, number>, idf: Map<string, number>): Map<string, number> {
  const vec = new Map<string, number>();
  tf.forEach((tfVal, term) => {
    vec.set(term, tfVal * (idf.get(term) || 1));
  });
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  a.forEach((val, key) => {
    dot += val * (b.get(key) || 0);
    magA += val * val;
  });
  b.forEach(val => { magB += val * val; });
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export interface SimilarityResult {
  index: number;
  score: number;
  text: string;
}

/**
 * Find top-K most similar documents to a query using TF-IDF cosine similarity
 */
export function findSimilar(query: string, corpus: string[], topK: number = 5): SimilarityResult[] {
  const queryTokens = tokenize(query);
  const corpusTokens = corpus.map(tokenize);
  const allDocs = [queryTokens, ...corpusTokens];
  const idf = computeIDF(allDocs);
  const queryVec = tfidfVector(computeTF(queryTokens), idf);
  const results: SimilarityResult[] = corpusTokens.map((tokens, i) => ({
    index: i,
    score: cosineSimilarity(queryVec, tfidfVector(computeTF(tokens), idf)),
    text: corpus[i],
  }));
  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Compute pairwise similarity matrix for a set of texts
 * Used for cluster validation and visualization
 */
export function similarityMatrix(texts: string[]): number[][] {
  const tokens = texts.map(tokenize);
  const idf = computeIDF(tokens);
  const vectors = tokens.map(t => tfidfVector(computeTF(t), idf));
  return vectors.map((a, i) => vectors.map((b, j) => i === j ? 1 : cosineSimilarity(a, b)));
}

/**
 * Extract top keywords from text using TF-IDF scores
 */
export function extractKeywords(text: string, corpus: string[], topK: number = 8): { term: string; score: number }[] {
  const tokens = tokenize(text);
  const allTokens = [tokens, ...corpus.map(tokenize)];
  const idf = computeIDF(allTokens);
  const vec = tfidfVector(computeTF(tokens), idf);
  return [...vec.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([term, score]) => ({ term, score: +score.toFixed(4) }));
}
