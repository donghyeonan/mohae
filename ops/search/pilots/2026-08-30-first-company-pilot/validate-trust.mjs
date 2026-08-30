import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const fail=m=>{throw new Error(m)};
const required=['verdict_id','subject_id','decision','reviewed_claim_ids','reason_codes','reviewed_at','reviewer_run_id'];
const allowed=new Set([...required,'required_evidence','expires_at']);
const decisions=new Set(['approve','hold','reject','revise']);
const files=['local-places.json','events-experiences.json','global-market.json'];
const evidenceFiles=['local-places.json','events-experiences.json','global-market.json'];
const claims=new Map();for(const f of evidenceFiles){const d=JSON.parse(fs.readFileSync(path.join(root,'evidence',f),'utf8'));for(const s of d.subjects)claims.set(s.subject_id,new Set(s.evidence_claims.map(c=>c.claim_id)))}
let count=0;const summary={};const subjects=new Set();
for(const f of files){const d=JSON.parse(fs.readFileSync(path.join(root,'trust',f),'utf8'));if(!Array.isArray(d.verdicts)||d.verdicts.length!==3)fail(`${f}: expected 3 verdicts`);for(const v of d.verdicts){count++;subjects.add(v.subject_id);for(const k of required)if(!(k in v))fail(`${v.verdict_id||f}: missing ${k}`);for(const k of Object.keys(v))if(!allowed.has(k))fail(`${v.verdict_id}: unexpected ${k}`);if(!decisions.has(v.decision))fail(`${v.verdict_id}: bad decision`);if(!claims.has(v.subject_id))fail(`${v.verdict_id}: unknown subject`);if(!Array.isArray(v.reviewed_claim_ids)||v.reviewed_claim_ids.length<1||v.reviewed_claim_ids.some(id=>!claims.get(v.subject_id).has(id)))fail(`${v.verdict_id}: invalid claim refs`);if(!Array.isArray(v.reason_codes)||v.reason_codes.length<1)fail(`${v.verdict_id}: missing reasons`);summary[v.decision]=(summary[v.decision]||0)+1}}
if(subjects.size!==9)fail('duplicate subject verdicts');console.log(JSON.stringify({verdicts:count,decisions:summary},null,2));
