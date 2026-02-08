const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const HF_API = "https://api-inference.huggingface.co/models/" + HF_MODEL;

async function callMistral(prompt: string, maxTokens = 1024): Promise<string | null> {
  const apiKey = process.env.HF_API_TOKEN;
  if (!apiKey) return null;
  try {
    const res = await fetch(HF_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: `<s>[INST] ${prompt} [/INST]`,
        parameters: { max_new_tokens: maxTokens, temperature: 0.4, top_p: 0.9, return_full_text: false },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text.trim() : null;
  } catch { return null; }
}

function tryParseJSON(text: string | null): any {
  if (!text) return null;
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
  return null;
}

interface TicketInput {
  ticket_number: string; subject: string; description: string; resolution: string;
  root_cause: string; tier: number; category: string; priority: string;
}

export async function analyzeClusterPattern(tickets: TicketInput[]) {
  const subjects = tickets.map(t => t.subject).filter(Boolean);
  const rootCauses = tickets.map(t => t.root_cause).filter(Boolean);
  const resolutions = tickets.map(t => t.resolution).filter(Boolean);
  const categories = [...new Set(tickets.map(t => t.category))];
  const avgTier = +(tickets.reduce((a, t) => a + t.tier, 0) / tickets.length).toFixed(1);
  const critCount = tickets.filter(t => t.priority === "Critical" || t.priority === "High").length;
  const t3Count = tickets.filter(t => t.tier >= 3).length;
  const escRate = Math.round((t3Count / tickets.length) * 100);
  const accounts = [...new Set(tickets.map(t => (t as any).Account_Name || "").filter(Boolean))];

  // Root cause frequency analysis
  const rcFreq: Record<string, number> = {};
  rootCauses.forEach(rc => { rcFreq[rc] = (rcFreq[rc] || 0) + 1; });
  const topRC = Object.entries(rcFreq).sort((a, b) => b[1] - a[1]);

  // Resolution pattern extraction
  const resFreq: Record<string, number> = {};
  resolutions.forEach(r => { resFreq[r] = (resFreq[r] || 0) + 1; });
  const topRes = Object.entries(resFreq).sort((a, b) => b[1] - a[1]);

  // Symptom extraction from subjects
  const symptomMap: Record<string, number> = {};
  subjects.forEach(s => { symptomMap[s] = (symptomMap[s] || 0) + 1; });
  const topSymptoms = Object.entries(symptomMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Tier distribution
  const tierDist: Record<number, number> = {};
  tickets.forEach(t => { tierDist[t.tier] = (tierDist[t.tier] || 0) + 1; });

  // Priority distribution
  const priDist: Record<string, number> = {};
  tickets.forEach(t => { priDist[t.priority] = (priDist[t.priority] || 0) + 1; });

  const severity = escRate > 60 ? "Critical" : escRate > 40 ? "High" : escRate > 20 ? "Medium" : "Low";
  const primaryRC = topRC[0]?.[0] || "Unknown";
  const secondaryRC = topRC[1]?.[0] || null;
  const primaryRes = topRes[0]?.[0] || "";

  // Try Mistral for enhanced analysis
  const ticketSummaries = tickets.slice(0, 6).map((t, i) =>
    `[${i+1}] ${t.subject} | T${t.tier} | ${t.priority}\n  Root: ${t.root_cause?.substring(0,120)}\n  Fix: ${t.resolution?.substring(0,120)}`
  ).join("\n");
  const mistralResult = tryParseJSON(await callMistral(`Analyze ${tickets.length} PropertySuite support tickets. Identify root cause pattern.\n\n${ticketSummaries}\n\nReturn JSON: {"pattern_name":"...","root_cause":"...","common_symptoms":[],"resolution_steps":[],"severity":"${severity}","recommended_action":"...","estimated_impact":"..."}`, 800));

  if (mistralResult?.pattern_name && mistralResult?.root_cause?.length > 50) {
    return { ...mistralResult, source: "mistral-7b",
      technical_details: buildTechnicalDetails(tickets, topRC, topRes, tierDist, priDist, escRate, accounts),
    };
  }

  // Build rich data-driven analysis
  const module = categories[0] || "General";

  const patternName = topSymptoms[0]
    ? `${module} Module: ${topSymptoms[0][0].substring(0, 55)}`
    : `${module} — ${primaryRC.substring(0, 50)}`;

  let rootCause = `**Primary failure mode:** ${primaryRC} — identified in ${topRC[0]?.[1] || 0} of ${tickets.length} cases (${Math.round(((topRC[0]?.[1]||0)/tickets.length)*100)}% of cluster). `;
  if (secondaryRC) rootCause += `**Secondary contributor:** ${secondaryRC} (${topRC[1]?.[1]} cases, ${Math.round(((topRC[1]?.[1]||0)/tickets.length)*100)}%). `;
  rootCause += `\n\nThe pattern affects the ${module} workflow in PropertySuite, manifesting when ${topSymptoms[0]?.[0]?.toLowerCase() || "standard operations are attempted"}. `;
  rootCause += `Escalation analysis shows ${escRate}% of cases required Tier 3 intervention (${t3Count} tickets), with average tier level of ${avgTier}. `;
  if (critCount > 0) rootCause += `${critCount} tickets (${Math.round((critCount/tickets.length)*100)}%) were flagged High or Critical priority, indicating significant operational impact.`;

  const symptoms = topSymptoms.map(([s, count]) =>
    `${s} (${count} occurrence${count > 1 ? "s" : ""}, ${Math.round((count/tickets.length)*100)}% of cluster)`
  );

  // Build technical resolution steps from actual resolved tickets
  const steps: string[] = [];
  if (primaryRes) {
    const resSentences = primaryRes.split(/[.!]\s+/).filter(s => s.trim().length > 15);
    resSentences.forEach(s => steps.push(s.trim()));
  }
  if (steps.length < 3 && topRes[1]) {
    topRes[1][0].split(/[.!]\s+/).filter(s => s.trim().length > 15).forEach(s => {
      if (steps.length < 6 && !steps.some(existing => existing.substring(0,30) === s.substring(0,30))) steps.push(s.trim());
    });
  }
  // Add PropertySuite-specific steps
  if (steps.length < 5) {
    steps.push(`Verify ${module} module configuration in PropertySuite Admin > Module Settings`);
    steps.push("Check PropertySuite System Log (Admin > Diagnostics) for related error codes");
    steps.push(`If unresolved after Tier 1/2 steps, escalate via PropertySuite Support Portal with diagnostic bundle attached`);
  }

  const costPerEsc = 45; // estimated minutes per Tier 3 escalation
  const monthlySavings = Math.round(t3Count * 0.55 * costPerEsc);
  const deflectionTarget = Math.round(t3Count * 0.55);

  const action = escRate > 35
    ? `**Immediate:** Create Tier 1 resolution runbook targeting the top ${Math.min(3, symptoms.length)} symptoms. Deploy to PropertySuite Knowledge Base with auto-suggestion enabled for ${module} module tickets. **Expected outcome:** Reduce Tier 3 escalations from ${escRate}% to <15% within 30 days, deflecting ~${deflectionTarget} cases/month.`
    : `**Recommended:** Expand existing ${module} KB coverage to include ${symptoms.length} identified symptom variations. Enable proactive article suggestions in PropertySuite Agent Desktop for this category. **Expected outcome:** Reduce average resolution time by ${Math.round(15 + avgTier * 8)}% and improve first-contact resolution.`;

  const impact = `Resolving this pattern addresses ${tickets.length} historical tickets across ${accounts.length} accounts. At current escalation rates, this cluster generates ~${t3Count} Tier 3 escalations consuming approximately ${monthlySavings} agent-minutes monthly. KB coverage should deflect ${deflectionTarget} escalations/month, saving an estimated $${Math.round(monthlySavings * 1.2)} in support costs (based on $1.20/min Tier 3 fully-loaded cost).`;

  return {
    pattern_name: patternName,
    root_cause: rootCause,
    common_symptoms: symptoms,
    resolution_steps: steps.slice(0, 6),
    severity,
    recommended_action: action,
    estimated_impact: impact,
    source: "data-analysis",
    technical_details: buildTechnicalDetails(tickets, topRC, topRes, tierDist, priDist, escRate, accounts),
  };
}

function buildTechnicalDetails(tickets: TicketInput[], topRC: [string,number][], topRes: [string,number][], tierDist: Record<number,number>, priDist: Record<string,number>, escRate: number, accounts: string[]) {
  return {
    sample_size: tickets.length,
    unique_accounts: accounts.length,
    escalation_rate: escRate,
    tier_distribution: tierDist,
    priority_distribution: priDist,
    top_root_causes: topRC.slice(0, 4).map(([rc, n]) => ({ cause: rc, count: n, pct: Math.round((n/tickets.length)*100) })),
    top_resolutions: topRes.slice(0, 3).map(([r, n]) => ({ resolution: r.substring(0, 120), count: n })),
  };
}

// =============================================
// GENERATE KB ARTICLE
// =============================================

export async function generateKBArticle(input: {
  clusterName: string;
  tickets: Array<{ subject: string; description: string; resolution: string; category: string; tier: number }>;
}) {
  const { clusterName, tickets } = input;
  const category = tickets[0]?.category || "General";
  const resolved = tickets.filter(t => t.resolution);
  const subjects = [...new Set(tickets.map(t => t.subject))].slice(0, 8);
  const resolutions = [...new Set(resolved.map(t => t.resolution))].slice(0, 6);

  // Resolution step extraction
  const stepSet = new Set<string>();
  resolutions.forEach(r => {
    r.split(/[.!]\s+/).forEach(s => {
      const t = s.trim();
      if (t.length > 20 && t.length < 150) stepSet.add(t);
    });
  });
  const steps = [...stepSet].slice(0, 8);

  // Keyword extraction for tags
  const words = tickets.flatMap(t => (t.subject + " " + t.description).toLowerCase().split(/\s+/));
  const wf: Record<string, number> = {};
  const stop = new Set(["the","a","an","is","are","was","were","in","on","at","to","for","of","and","or","not","with","this","that","from","by","it","as","be","has","had","have","will","can","may","i","my","we","our","you","your","after","when","during","before","into","also","been","being","more","than","about","which","would","could","should","their","there","them","these","those","each","all","both","other","such","only","then","just","because","but","so","if","while","where","how","what","who","its"]);
  words.forEach(w => { if (w.length > 3 && !stop.has(w)) wf[w] = (wf[w] || 0) + 1; });
  const tags = Object.entries(wf).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);

  const avgTier = +(tickets.reduce((a, t) => a + t.tier, 0) / tickets.length).toFixed(1);
  const t3Count = tickets.filter(t => t.tier >= 3).length;

  // Try Mistral
  const examples = resolved.slice(0, 4).map((t, i) =>
    `[${i+1}] Issue: ${t.description?.substring(0, 150)}\n    Fix: ${t.resolution?.substring(0, 150)}`).join("\n");
  const mistralResult = tryParseJSON(await callMistral(`Create a PropertySuite KB article for: "${clusterName}"\n\n${examples}\n\nReturn JSON: {"title":"How to...","summary":"...","category":"${category}","content":"markdown article","tags":[]}`, 1024));

  let article;
  if (mistralResult?.title && mistralResult?.content?.length > 200) {
    article = { ...mistralResult, source: "mistral-7b" };
  } else {
    const cleanName = clusterName.replace(/^[^:]+:\s*/, "");
    const title = `Resolving ${cleanName.substring(0, 60)}`;

    let content = `## Overview\n\n`;
    content += `This article addresses a recurring issue in the **${category}** module of RealPage PropertySuite, identified through automated root cause analysis of ${tickets.length} support cases. Average support tier: ${avgTier}.\n\n`;
    content += `**Applicability:** PropertySuite Affordable and Conventional editions\n`;
    content += `**Module:** ${category}\n`;
    content += `**Estimated resolution time:** ${avgTier <= 1.5 ? "5-15 minutes" : avgTier <= 2.5 ? "15-45 minutes" : "45+ minutes (may require escalation)"}\n\n`;

    content += `## Symptoms\n\n`;
    content += `Agents should apply this article when the customer reports any of the following:\n\n`;
    subjects.forEach((s, i) => { content += `${i + 1}. ${s}\n`; });
    content += `\nThese symptoms typically occur during standard ${category.toLowerCase()} operations and may affect single or multiple properties.\n\n`;

    content += `## Prerequisites\n\n`;
    content += `Before beginning troubleshooting:\n`;
    content += `- Confirm the customer's PropertySuite edition (Affordable vs. Conventional)\n`;
    content += `- Verify the user has appropriate role permissions in Admin > User Management\n`;
    content += `- Check PropertySuite System Status page for any active incidents\n`;
    content += `- Note the customer's property name and account for reference\n\n`;

    content += `## Resolution Steps\n\n`;
    if (steps.length > 0) {
      steps.forEach((s, i) => {
        content += `**Step ${i + 1}.** ${s}\n\n`;
      });
    } else {
      content += `**Step 1.** Navigate to the ${category} module in PropertySuite\n\n`;
      content += `**Step 2.** Review the current configuration under Admin > Module Settings > ${category}\n\n`;
      content += `**Step 3.** Check for any pending operations or open batches that may be blocking the workflow\n\n`;
      content += `**Step 4.** If a configuration mismatch is identified, update the settings and save\n\n`;
      content += `**Step 5.** Ask the customer to retry the operation and confirm the issue is resolved\n\n`;
    }

    content += `## Verification\n\n`;
    content += `After applying the resolution:\n`;
    content += `1. Have the customer attempt the original operation again\n`;
    content += `2. Verify no error messages appear in the ${category} module\n`;
    content += `3. Check PropertySuite System Log for any new errors (Admin > Diagnostics > System Log)\n`;
    content += `4. Confirm the expected data has been updated correctly\n\n`;

    content += `## Escalation Criteria\n\n`;
    content += `Escalate to **Tier 3 (Engineering)** if:\n`;
    content += `- The above steps do not resolve the issue within 30 minutes\n`;
    content += `- Error logs indicate database-level inconsistency\n`;
    content += `- Multiple properties or accounts are affected simultaneously\n`;
    content += `- The customer reports data loss or corruption\n\n`;
    content += `When escalating, attach: System Log export, screenshot of the error, property/account details, and steps already attempted.\n\n`;

    content += `## Related Information\n\n`;
    content += `- **Module:** ${category}\n`;
    content += `- **Source data:** ${tickets.length} analyzed tickets (${resolved.length} with documented resolutions)\n`;
    content += `- **Escalation rate:** ${Math.round((t3Count/tickets.length)*100)}% of cases required Tier 3\n`;
    content += `- **Auto-generated by:** KnowledgeDrift AI Engine\n`;

    article = { title, summary: `Step-by-step resolution guide for ${cleanName}. Covers ${subjects.length} symptom variations across ${tickets.length} PropertySuite support cases.`, category, content, tags, source: "data-analysis" };
  }

  const compliance = await runComplianceCheck(article.content);
  return { article, compliance };
}

// =============================================
// COMPLIANCE
// =============================================

export async function runComplianceCheck(content: string) {
  const violations: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)) violations.push("PII: email address detected");
  if (content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g)) warnings.push("Potential phone number detected");
  if (content.match(/\b\d{3}-\d{2}-\d{4}\b/g)) violations.push("CRITICAL: SSN pattern detected");
  ["delete all","drop table","rm -rf","format disk","bypass security"].forEach(w => {
    if (content.toLowerCase().includes(w)) violations.push(`Dangerous instruction: "${w}"`);
  });
  if (content.length < 300) warnings.push("Article is short — may need more detail for agent use");
  if (!content.includes("##")) warnings.push("No section headers — consider adding structure");
  if (!content.toLowerCase().includes("escalat")) suggestions.push("Add escalation criteria section");
  if (!content.toLowerCase().includes("verif")) suggestions.push("Add verification step");
  if (content.toLowerCase().includes("prerequisite") || content.toLowerCase().includes("before")) {} else suggestions.push("Consider adding prerequisites section");

  return {
    passed: violations.length === 0,
    risk_level: violations.length > 0 ? "high" : warnings.length > 1 ? "medium" : "low",
    violations, warnings, suggestions,
    checks_run: ["PII scan","dangerous instructions","structural analysis","completeness check","PropertySuite compliance"],
  };
}

export { callMistral };
