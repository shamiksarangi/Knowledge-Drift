# KnowledgeDrift

**AI-powered self-learning support intelligence for RealPage PropertySuite**

**Live Demo:** https://knowledge-drift.vercel.app
Zoom to fit screen, if does not render with correct scale.

---

## Problem

Support teams managing RealPage PropertySuite handle thousands of tickets across 12+ modules (TRACS, HAP/Voucher, Certifications, Move-In/Out, etc.). Common issues repeat, knowledge base articles go stale, and Tier 3 escalations waste engineering time on problems that should be solved at Tier 1.

## Solution

KnowledgeDrift is a self-learning support intelligence platform that:

1. **Ingests** 1,400+ support tickets with multi-turn conversation transcripts
2. **Detects** root cause failure patterns using TF-IDF cosine similarity clustering
3. **Predicts** Tier 3 escalations using logistic regression on ticket features
4. **Generates** knowledge base articles automatically using Mistral-7B with compliance checks
5. **Monitors** KB health across 4 quality dimensions and alerts on decaying articles

## Live Features

**Live Pipeline Simulator** — Watch KnowledgeDrift process a real ticket in real time: TF-IDF keyword extraction, cosine similarity cluster matching, KB search, and gap detection. Every click processes a different ticket.

**Agent Copilot** — Paste any customer message. AI generates a KB-grounded suggested response with citations, confidence scoring, and escalation risk assessment. Agents can copy the response directly.

**Conversational KB Search** — Type any support question. TF-IDF cosine similarity searches 3,207 articles instantly, returns ranked results with relevance scores, and flags coverage gaps.

**Anomaly Detection** — Z-score statistical analysis on ticket velocity per category. Detects sudden spikes or drops that indicate emerging issues before they become trends.

**Escalation Predictor** — Logistic regression model predicts which tickets will escalate to Tier 3, using priority scoring, category risk, error keyword detection, and critical language analysis. Shows probability and contributing factors per ticket.

**Knowledge Drift Timeline** — Real-time feed showing knowledge gaps detected, AI articles generated, quality decay events, and anomaly spikes — visualizing how the knowledge base evolves.

**Sentiment Heatmap** — Module-by-sentiment matrix showing where customer frustration concentrates across PropertySuite, enabling targeted KB improvements.

**AI Root Cause Analysis** — Click any failure cluster to run Mistral-7B against actual tickets. Produces pattern identification, resolution procedures, cost impact estimates, and a Before/After projection.

**Auto KB Generation** — Creates full articles with Overview, Symptoms, Prerequisites, Resolution Steps, Verification, and Escalation Criteria. Runs 5 compliance checks (PII scan, dangerous instructions, structural analysis, completeness, PropertySuite compliance).

**Before/After Impact Projection** — Quantified savings per cluster: escalation rate reduction, resolution time improvement, dollars saved based on Tier 3 fully-loaded cost.

**4-Dimension Quality Scoring** — Every KB article scored on Accuracy (40%), Freshness (25%), Usage (20%), and Confusion Rate (15%) with automated decay alerts.

## Technical Architecture

**Frontend:** Next.js 14, TypeScript, Tailwind CSS

**AI Engine:** Mistral-7B-Instruct v0.3 via HuggingFace Inference API with intelligent local fallbacks (src/lib/ai.ts — 288 lines)

**Similarity Engine:** Custom TF-IDF cosine similarity in pure TypeScript — tokenization, augmented term frequency, inverse document frequency, vector generation, and cosine similarity. Zero dependencies. (src/lib/similarity.ts — 107 lines)

**Analytics Engine:** Statistical anomaly detection (Z-score), logistic regression escalation predictor (sigmoid + feature engineering), drift timeline analysis, sentiment heatmap generation. Zero dependencies. (src/lib/analytics.ts — 288 lines)

**Data Layer:** 1,400 tickets, 1,400 conversations, 3,207 KB articles, 714 agent scripts, 168 root cause clusters, 50 evaluation questions

**API Layer:** 17 endpoints covering AI analysis, KB search, pipeline simulation, escalation prediction, anomaly detection, cluster management, and more

**Deployment:** Vercel

## Key Technical Highlights

**TF-IDF Cosine Similarity Engine** — Pure TypeScript. Tokenization with stop word removal, augmented term frequency (0.5 + 0.5 * raw_freq/max_freq), smoothed IDF (log((N+1)/(df+1)) + 1), vector dot product / magnitude product. Used for KB search, cluster matching, and ticket similarity.

**Logistic Regression Escalation Predictor** — Sigmoid activation on 6 engineered features: priority score, historical category risk, subject length, error keyword presence, critical language detection, and sentiment. Pre-trained weights fitted on historical escalation patterns.

**Z-Score Anomaly Detection** — Computes weekly ticket velocity baselines per category, calculates mean and standard deviation over 12-week sliding window, flags any category where current volume exceeds 1.5 standard deviations.

**Agent Copilot** — Takes raw customer text, runs TF-IDF against KB corpus, generates grounded response with inline citations, and computes escalation risk from match confidence.

**Compliance Pipeline** — PII detection (email, phone, SSN regex patterns), dangerous instruction scanning, structural validation (headers, sections), and PropertySuite-specific checks.

## Project Structure

**Pages:** Dashboard (overview + live simulator + KB search + copilot + anomaly detection + escalation predictor + drift timeline + sentiment heatmap), Root Cause Mining (cluster galaxy + AI analysis), Knowledge Quality (scoring + decay alerts), Learning Engine (self-learning events), Evaluation (retrieval accuracy)

**API Endpoints (17):** /api/ai, /api/search, /api/simulate, /api/analytics, /api/copilot, /api/clusters, /api/tickets, /api/knowledge, /api/evaluation, /api/learning, /api/stats, and more

**Components:** LiveSimulator, KBSearch, AgentCopilot, AnomalyDetector, EscalationPredictor, DriftTimeline, SentimentHeatmap, Sidebar, Shell

**Libraries:** ai.ts (Mistral-7B engine), similarity.ts (TF-IDF), analytics.ts (anomaly detection + logistic regression + drift + heatmap), data.ts (data access)

**Data:** 1,400 tickets, 1,400 conversations, 3,207 KB articles, 714 agent scripts, evaluation sets, lineage tracking

## Run Locally

```bash
git clone https://github.com/shamiksarangi/Knowledge-Drift.git
cd Knowledge-Drift
npm install
npm run dev
```

Optionally add a HuggingFace token in .env.local:

```
HF_API_TOKEN=hf_your_token_here
```

The platform works fully without an API key using intelligent local analysis.

## Metrics

- 3,000+ lines of custom TypeScript
- 17 API endpoints
- 3 custom ML engines (TF-IDF, logistic regression, Z-score anomaly detection)
- 1,400 tickets with realistic multi-turn conversations
- 3,207 KB articles with quality scores
- 168 root cause clusters
- Zero ML library dependencies — all algorithms implemented from scratch

---

Built for HackNation Track 5 — AI-Powered Support Intelligence
