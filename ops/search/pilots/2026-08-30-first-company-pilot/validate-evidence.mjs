import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const fail=m=>{throw new Error(m)};
const claimRequired=['claim_id','subject_id','claim_type','claim_text','polarity','source_url','source_role','source_snapshot_id','observed_at','confidence','inference_level','verification_status'];
const claimAllowed=new Set([...claimRequired,'subtype','source_content_hash','valid_from','valid_until','supersedes_claim_id','beneficiary_scope','acquisition_condition','competing_explanations','conflict_notes']);
const supportRequired=['support_id','claim_id','chip','support_strength','created_at'];
const supportAllowed=new Set([...supportRequired,'reason']);
const claimTypes=new Set(['identity','operation','availability','price','benefit','recognition','demand','scarcity','safety','legality','quality','trend','causal_explanation','other']);
const polarities=new Set(['positive','negative','neutral','conflicting']);
const roles=new Set(['official','selection_body','merchant','organizer','booking','ticketing','map','platform','behavior','editorial','news','community','other']);
const confidence=new Set(['high','medium','low']);
const inference=new Set(['direct','associated','supported_causal_hypothesis','causal_confirmed']);
const verification=new Set(['unverified','verified','disputed','superseded','rejected']);
const chips=new Set(['MERIT','HEAT','SCARCITY','PAYOFF','SOCIAL_CURRENCY']);
const files=['local-places.json','events-experiences.json','global-market.json'];
const claimIds=new Set(),supportIds=new Set();let subjects=0,claims=0,supports=0;
for(const file of files){
 const p=path.join(root,'evidence',file);if(!fs.existsSync(p)) fail(`missing ${file}`);
 const doc=JSON.parse(fs.readFileSync(p,'utf8'));
 if(!Array.isArray(doc.subjects)||doc.subjects.length!==3) fail(`${file}: expected 3 subjects`);
 for(const s of doc.subjects){subjects++;
  if(!s.subject_id||!s.canonical_title||!Array.isArray(s.lead_ids)||!Array.isArray(s.evidence_claims)||!Array.isArray(s.chip_support)||!Array.isArray(s.unresolved)) fail(`${file}: invalid subject envelope`);
  const localClaims=new Set();
  for(const c of s.evidence_claims){claims++;
   for(const k of claimRequired) if(!(k in c)) fail(`${c.claim_id||file}: missing ${k}`);
   for(const k of Object.keys(c)) if(!claimAllowed.has(k)) fail(`${c.claim_id}: unexpected ${k}`);
   if(c.subject_id!==s.subject_id) fail(`${c.claim_id}: subject mismatch`);
   if(claimIds.has(c.claim_id)) fail(`duplicate claim ${c.claim_id}`); claimIds.add(c.claim_id);localClaims.add(c.claim_id);
   if(!claimTypes.has(c.claim_type)||!polarities.has(c.polarity)||!roles.has(c.source_role)||!confidence.has(c.confidence)||!inference.has(c.inference_level)||!verification.has(c.verification_status)) fail(`${c.claim_id}: invalid enum`);
   try{new URL(c.source_url)}catch{fail(`${c.claim_id}: invalid URL`)}
  }
  for(const x of s.chip_support){supports++;
   for(const k of supportRequired) if(!(k in x)) fail(`${x.support_id||file}: missing ${k}`);
   for(const k of Object.keys(x)) if(!supportAllowed.has(k)) fail(`${x.support_id}: unexpected ${k}`);
   if(supportIds.has(x.support_id)) fail(`duplicate support ${x.support_id}`);supportIds.add(x.support_id);
   if(!localClaims.has(x.claim_id)||!chips.has(x.chip)||!['direct','partial','context_only'].includes(x.support_strength)) fail(`${x.support_id}: invalid support`);
  }
 }
}
console.log(JSON.stringify({subjects,claims,supports},null,2));
