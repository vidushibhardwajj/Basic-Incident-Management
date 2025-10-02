/**
 * Simple rule-based classifier for incident categorization and prioritization.
 * Replace this module with an ML model/service later.
 *
 * Input: { title, description, severity, metadata }
 * Output: { category, priority, severity }
 */

const CATEGORY_RULES = [
  {category: 'Database', keywords: ['database','db','sql','postgres','mysql','mongod','mongodb']},
  {category: 'Network', keywords: ['network','latency','dns','timeout','connection','packet','bandwidth']},
  {category: 'Authentication', keywords: ['auth','login','signin','token','oauth','permission','unauthorized']},
  {category: 'Payments', keywords: ['payment','checkout','card','stripe','paypal','transaction']},
  {category: 'API', keywords: ['api','endpoint','response','500','502','503','gateway']},
  {category: 'UI', keywords: ['ui','frontend','css','javascript','react','angular','visual']},
  {category: 'Storage', keywords: ['disk','storage','s3','bucket','file','filesystem']},
];

function textToTokens(s) {
  if(!s) return [];
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreCategory(tokens) {
  const counts = {};
  for (const rule of CATEGORY_RULES) {
    counts[rule.category] = 0;
    for (const kw of rule.keywords) {
      if (tokens.includes(kw)) counts[rule.category] += 1;
    }
  }
  // pick category with highest count > 0, else 'General'
  let best = 'General';
  let bestCount = 0;
  for (const k of Object.keys(counts)) {
    if (counts[k] > bestCount) { best = k; bestCount = counts[k]; }
  }
  return best;
}

function determinePriority({tokens, severity}) {
  // severity from user can be 'low','medium','high','critical' or numeric
  const sev = (severity || '').toString().toLowerCase();
  if (sev === 'critical' || sev === '4' || sev === 'urgent') return 'P0';
  if (sev === 'high' || sev === '3') return 'P1';
  // keyword-based escalation
  const highWords = ['outage','down','failed','data loss','data-loss','panic','urgent','critical'];
  for (const w of highWords) {
    if (tokens.includes(w)) return 'P0';
  }
  // latency/timeout/network errors high
  const p1words = ['timeout','latency','error','500','502','503','slow','degraded'];
  for (const w of p1words) if (tokens.includes(w)) return 'P1';
  return 'P2';
}

module.exports.categorizeAndPrioritize = function({title, description, severity, metadata}) {
  const tokens = [...textToTokens(title), ...textToTokens(description)];
  const category = scoreCategory(tokens);
  const priority = determinePriority({tokens, severity});
  return {category, priority, severity: severity || 'medium'};
};
