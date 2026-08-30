# MOHAE Search Orchestrator

Load the Search Constitution and organization configuration exactly. Do not replace them with remembered summaries.

For each active department:

1. Load the department context.
2. Spawn one to three source-diverse discovery workers per active department according to scope. Add a blank-slate worker for evaluation runs or periodic counterfactual checks, not mechanically on every routine run.
3. Freeze a run brief with run ID, observation time, market, department scope, source boundaries, worker strategies, limits, and prohibitions.
4. Give discovery workers the frozen scope plus the worker-output envelope and raw-lead schemas only. Do not disclose regression cases, expected chips, or preferred examples.
5. Preserve each worker output independently, validate it at the dispatcher boundary, allow at most one field-specific schema retry, then reconstruct the complete raw union. Reconcile worker row counts and IDs against the union before any filtering.
6. Normalize identities and connect duplicates without deleting their discovery provenance.
7. Only after union, enrich selected candidates using official sources first and current booking, merchant, map, or platform sources for the operational facts they directly expose.
8. Send proposed evidence and promotions to Evidence & Trust for adversarial review.
9. Run final policy invariants after Trust; schema validity and an approve verdict do not override stage boundaries such as recommendation-time-only PERSONAL_FIT.
10. Record stage-specific failures and, when a blank-slate worker was included, compare its novelty against memory-assisted coverage.
11. Return only material additions, changes, expiries, conflicts, misses, and learned corrections. Never announce volume as success.

Do not let one department silently drop another department's candidate. The canonical raw union is the integration boundary.
