import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const brief = JSON.parse(fs.readFileSync(path.join(root, 'run-brief.json'), 'utf8'));
const requiredLead = ['lead_id', 'raw_title', 'raw_description', 'discovery_url', 'canonical_url', 'discovered_via', 'source_type', 'market', 'published_at', 'observed_at', 'possible_entities', 'raw_dates', 'raw_numbers', 'uncertainties'];
const allowedLead = new Set(requiredLead);
const allowedEnvelope = new Set(['run_id', 'department_id', 'worker_id', 'worker_mode', 'source_strategy', 'observed_at', 'leads']);
const allowedSourceTypes = new Set(['official', 'platform', 'editorial', 'social', 'community', 'news', 'search', 'other']);
const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const fail = message => { throw new Error(message); };

if (brief.run_class !== 'non_production_learning_pilot') fail('wrong run_class');
if (!Array.isArray(brief.workers) || brief.workers.length !== 12) fail('expected 12 workers');
if (new Set(brief.workers.map(w => w.worker_id)).size !== 12) fail('duplicate worker_id in brief');
for (const departmentId of ['local_places', 'events_experiences', 'global_market']) {
  const departmentWorkers = brief.workers.filter(w => w.department_id === departmentId);
  if (departmentWorkers.length !== 4) fail(`${departmentId}: expected 4 workers`);
  if (departmentWorkers.filter(w => w.worker_mode === 'memory_assisted').length !== 3) fail(`${departmentId}: expected 3 memory-assisted workers`);
  if (departmentWorkers.filter(w => w.worker_mode === 'blank_slate').length !== 1) fail(`${departmentId}: expected 1 blank-slate worker`);
}

const workersDir = path.join(root, 'workers');
if (!fs.existsSync(workersDir)) {
  console.log(JSON.stringify({run_id: brief.run_id, brief_valid: true, workers_present: 0}, null, 2));
  process.exit(0);
}

const outputs = [];
for (const spec of brief.workers) {
  const file = path.join(workersDir, `${spec.worker_id}.json`);
  if (!fs.existsSync(file)) fail(`missing worker output ${spec.worker_id}`);
  const out = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const key of allowedEnvelope) if (!(key in out)) fail(`${spec.worker_id}: missing ${key}`);
  for (const key of Object.keys(out)) if (!allowedEnvelope.has(key)) fail(`${spec.worker_id}: unexpected envelope key ${key}`);
  if (out.run_id !== brief.run_id || out.department_id !== spec.department_id || out.worker_id !== spec.worker_id || out.worker_mode !== spec.worker_mode) fail(`${spec.worker_id}: envelope mismatch`);
  if (!rfc3339.test(out.observed_at)) fail(`${spec.worker_id}: invalid observed_at`);
  if (!Array.isArray(out.leads) || out.leads.length > brief.limits.max_leads_per_worker) fail(`${spec.worker_id}: invalid lead count`);
  for (const [index, lead] of out.leads.entries()) {
    for (const key of requiredLead) if (!(key in lead)) fail(`${spec.worker_id}[${index}]: missing ${key}`);
    for (const key of Object.keys(lead)) if (!allowedLead.has(key)) fail(`${spec.worker_id}[${index}]: unexpected key ${key}`);
    if (!String(lead.lead_id).startsWith(`${spec.worker_id}-`)) fail(`${spec.worker_id}[${index}]: lead_id must be worker-prefixed`);
    if (!allowedSourceTypes.has(lead.source_type)) fail(`${spec.worker_id}[${index}]: invalid source_type`);
    try { new URL(lead.discovery_url); } catch { fail(`${spec.worker_id}[${index}]: invalid discovery_url`); }
    if (lead.canonical_url !== null) try { new URL(lead.canonical_url); } catch { fail(`${spec.worker_id}[${index}]: invalid canonical_url`); }
    if (lead.published_at !== null && !rfc3339.test(lead.published_at)) fail(`${spec.worker_id}[${index}]: invalid published_at`);
    if (!rfc3339.test(lead.observed_at)) fail(`${spec.worker_id}[${index}]: invalid observed_at`);
    for (const key of ['possible_entities', 'raw_dates', 'raw_numbers', 'uncertainties']) if (!Array.isArray(lead[key])) fail(`${spec.worker_id}[${index}]: ${key} must be array`);
  }
  outputs.push(out);
}

const flat = outputs.flatMap(out => out.leads.map((lead, worker_lead_index) => ({
  run_id: out.run_id,
  department_id: out.department_id,
  worker_id: out.worker_id,
  worker_mode: out.worker_mode,
  source_strategy: out.source_strategy,
  worker_lead_index,
  lead
})));
const ids = flat.map(row => row.lead.lead_id);
if (new Set(ids).size !== ids.length) fail('duplicate lead_id across union');

const expectedUnion = flat.map(row => JSON.stringify(row)).join('\n') + (flat.length ? '\n' : '');
const unionPath = path.join(root, 'raw-union.jsonl');
if (!fs.existsSync(unionPath)) fail('missing raw-union.jsonl; run build-union.mjs once');
if (fs.readFileSync(unionPath, 'utf8') !== expectedUnion) fail('raw-union.jsonl differs from the immutable worker-output derivation');
const workerCounts = Object.fromEntries(outputs.map(out => [out.worker_id, out.leads.length]));
const expectedReconciliation = {
  run_id: brief.run_id,
  expected_worker_count: brief.workers.length,
  received_worker_count: outputs.length,
  worker_counts: workerCounts,
  worker_row_sum: Object.values(workerCounts).reduce((a, b) => a + b, 0),
  union_count: flat.length,
  integration_loss_count: Object.values(workerCounts).reduce((a, b) => a + b, 0) - flat.length
};
const reconciliationPath = path.join(root, 'union-reconciliation.json');
if (!fs.existsSync(reconciliationPath)) fail('missing union-reconciliation.json; run build-union.mjs once');
const actualReconciliation = JSON.parse(fs.readFileSync(reconciliationPath, 'utf8'));
if (JSON.stringify(actualReconciliation) !== JSON.stringify(expectedReconciliation)) fail('union-reconciliation.json differs from the worker-output derivation');
console.log(JSON.stringify({...expectedReconciliation, read_only_verification: true}, null, 2));
