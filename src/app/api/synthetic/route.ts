import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["Advance Property Date","General","Certifications","Move-In","HAP / Voucher Processing","Move-Out","TRACS File","Close Bank Deposit","Unit Transfer","Gross Rent Change","Waitlist","Security Deposit"];
const PRIORITIES = ["Low","Medium","High","Critical"];
const AGENTS = ["Alex","Jamie","Taylor","Morgan","Casey","Jordan"];
const PRODUCTS = ["ExampleCo PropertySuite Affordable","ExampleCo PropertySuite Conventional"];
const ISSUES: Record<string,string[]> = {
  "Advance Property Date": ["Date advance fails with validation error","Cannot advance property date — open batches blocking","Backend voucher reference invalid during date advance"],
  "General": ["User cannot access reporting module after update","System performance degraded during batch operations","Export function producing blank CSV files"],
  "Certifications": ["Certification workflow blocked after data import","50059 compliance check failing for tenants","Annual recertification dates not populating"],
  "Move-In": ["Move-in process stuck at security deposit step","Lease start date validation error","Unit availability not updating"],
  "HAP / Voucher Processing": ["HAP payment amount mismatch","Voucher processing batch timing out","Housing authority reconciliation discrepancy"],
  "Move-Out": ["Move-out charges not applying to ledger","Security deposit refund calculation wrong","Unit status not updating after move-out"],
};
const RESOLUTIONS = ["Validated issue, cleared cache, reprocessed successfully.","Identified config mismatch, updated settings, verified fix.","Escalated to Tier 3 for backend fix. Applied script, confirmed resolution.","Walked customer through correct workflow. Was navigation error.","Reset module settings to default, reconfigured. Verified working."];
const ROOT_CAUSES = ["Data inconsistency requiring backend fix","Configuration mismatch","User navigation error","Cache invalidation issue","Missing prerequisite data","Batch processing timeout"];
const PROPERTIES = ["Heritage Point","Sunrise Gardens","Oak Ridge Estates","Maple Creek Village","Cedar Heights","Willow Park","Brookstone Terrace","Lakewood Manor"];
const COMPANIES = ["Oak & Ivy Management","Summit Property Group","Greenfield Holdings","Apex Residential","Cornerstone Mgmt","Pinnacle Properties"];
const NAMES = ["Morgan Johnson","Jordan Williams","Alex Brown","Taylor Davis","Casey Martinez","Riley Anderson"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genCase() {
  const category = pick(CATEGORIES);
  const tier = pick([1, 2, 3]);
  const agent = pick(AGENTS);
  const product = pick(PRODUCTS);
  const property = pick(PROPERTIES);
  const company = pick(COMPANIES);
  const contact = pick(NAMES);
  const issueOpts = ISSUES[category] || ISSUES["General"];
  const issue = pick(issueOpts);
  const resolution = pick(RESOLUTIONS);
  const ticketNum = `CS-SYN-${Math.floor(10000000 + Math.random() * 89999999)}`;
  const convId = `CONV-SYN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const created = new Date(2025, Math.floor(Math.random() * 6), Math.floor(1 + Math.random() * 28), 8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  const resMin = tier === 1 ? 5 + Math.floor(Math.random() * 25) : tier === 2 ? 20 + Math.floor(Math.random() * 80) : 60 + Math.floor(Math.random() * 240);
  const closed = new Date(created.getTime() + resMin * 60000);
  const transcript = [
    `${agent} (ExampleCo): Thanks for contacting ExampleCo Support. This is ${agent}. How can I help?`,
    `${contact}: Hi, I need help with ${product} for ${property}. ${issue}.`,
    `${agent} (ExampleCo): Let me look into that. Can you confirm which module you're in?`,
    `${contact}: I'm in the ${category} module.`,
    `${agent} (ExampleCo): Got it. Let me check a few things.`,
    `${agent} (ExampleCo): ${resolution}`,
    `${contact}: That worked, thank you!`,
    `${agent} (ExampleCo): Glad to help! I'll close this case.`
  ].join("\n");

  return {
    ticket: { Ticket_Number: ticketNum, Conversation_ID: convId, Created_At: created.toISOString(), Closed_At: closed.toISOString(), Status: "Closed", Priority: pick(PRIORITIES), Tier: tier, Product: product, Module: category, Category: category, Case_Type: "Incident", Account_Name: company, Property_Name: property, Contact_Name: contact, Subject: issue, Description: `${issue}. Impacting ${property}. Category: ${category}.`, Resolution: resolution, Root_Cause: pick(ROOT_CAUSES), Tags: category.toLowerCase() },
    conversation: { Ticket_Number: ticketNum, Conversation_ID: convId, Channel: pick(["Chat","Phone"]), Conversation_Start: created.toISOString(), Conversation_End: closed.toISOString(), Agent_Name: agent, Product: product, Category: category, Issue_Summary: issue, Transcript: transcript, Sentiment: pick(["Positive","Neutral","Negative","Frustrated"]) }
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = Math.min(body.count || 5, 50);
  const cases = Array.from({ length: count }, () => genCase());
  return NextResponse.json({ generated: cases.length, cases });
}
