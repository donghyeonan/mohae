# MOHAE Search Backend

> 상태: developer reference / logical backend draft
>
> 현재 `apps/mohae`는 정적 JavaScript와 `localStorage`만 사용한다. 이 디렉터리에는 Search 운영 계약과 비생산 pilot 기록이 있으며, dispatcher·scheduler·운영 DB·제품 feed는 아직 구현되어 있지 않다.

## 1. 역할

MOHAE Search는 사용자가 검색어를 정하기 전에 장소, 행사, 혜택, 상품, 형식, 트렌드 후보를 수집하고 다음 단계로 전달한다.

```text
public discovery
  -> raw union
  -> canonical subjects
  -> sourced observations and material claims
  -> chip support
  -> trust review
  -> product card or contextual recommendation
  -> exposure and outcome events
```

현재 Search scope는 예약·결제 실행이나 장소 백과사전을 포함하지 않는다. 제품 전체의 booking/payment ownership은 보류 상태다. 변동성이 큰 운영 정보는 현재 출처와 관측 시각을 보존하고, 상세·저장·추천·실행 시점에 다시 확인한다.

## 2. 저장 경계

| 저장 위치 | 소유 데이터 |
|---|---|
| MOHAE repository | 헌법, 조직 설정, prompt, JSON Schema, validator, pilot bundle |
| GBrain `mohae` source | 압축된 부서 brief, 공통 playbook, 장기 판단 |
| Operational DB | 실행별 worker, raw lead, union, canonical subject, 관측, claim, trust, promotion, evaluation, product lineage |
| Product DB | 사용자 profile, published card, recommendation, swipe·save·attendance, map·plan 상태 |

고용량 실행 기록과 변동 상태는 GBrain에 저장하지 않는다. 정확한 runtime 계약은 repository 파일을 기준으로 한다.

### 필수 context 조회 계약

`organization.yaml`은 role prompt의 repository 경로와 GBrain context의 `source_id + slug`를 안정 주소로 등록한다. Orchestrator는 dispatch 전에 공통 playbook, 활성 부서 brief, 필요한 control-function brief를 exact lookup으로 읽고 repository HEAD, 각 repository artifact의 dirty 상태·content hash, GBrain source ID·slug·content hash를 run context snapshot에 기록한다. Dirty artifact가 하나라도 있으면 해당 실행은 commit-bound가 아니라 working-tree snapshot으로 표시한다. 필수 context에는 recall, keyword search, semantic search를 fallback으로 사용하지 않으며 하나라도 없으면 dispatch를 중단한다. Blank-slate worker에는 의도적으로 부서 memory와 playbook을 전달하지 않는다.

Embedding은 주소를 모르는 자유형 지식 탐색의 선택적 보조 수단이지, 부서 실행 context의 선행조건이 아니다. Pilot 001은 이 계약 이전의 frozen artifact라 `context_snapshot`이 없으며, run-brief schema는 과거 재현성을 위해 해당 필드를 optional로 허용한다. 새 dispatcher run은 orchestrator 계약에 따라 snapshot을 반드시 생성한다.

## 3. 부서

정의 원본: [`organization.yaml`](organization.yaml)

| ID | 역할 | discovery 참여 | 소유 객체 |
|---|---|---:|---|
| `local_places` | Local Places & Offers | yes | place, branch, permanent venue, offer, price observation |
| `events_experiences` | Events & Experiences | yes | series, occurrence, event offer, application state |
| `global_market` | Global & Market Intelligence | yes | trend thread, market diffusion, startup signal, business model |
| `evidence_trust` | Evidence & Trust | no | evidence claim, conflict, duplicate relation, integrity review |

`evidence_trust`는 control function이다. discovery 후보를 대신 찾거나 누락 후보를 보충하지 않는다.

## 4. 실행 흐름

1. **Run brief**
   - 시장, 목적, 활성 부서, worker, 제한 사항을 고정한다.
   - Schema: [`schemas/run-brief.schema.json`](schemas/run-brief.schema.json)
2. **Discovery worker output**
   - routine discovery는 활성 부서마다 범위와 source family에 따라 1~3개 worker를 사용한다.
   - evaluation 또는 periodic counterfactual은 별도 blank-slate worker를 추가할 수 있으며, run brief schema는 Pilot 001 재현을 위해 최대 12개를 수용한다.
   - worker는 추천, 점수, chip을 만들지 않는다.
   - Schema: [`schemas/worker-output-envelope.schema.json`](schemas/worker-output-envelope.schema.json)
3. **Raw union**
   - 모든 worker 결과를 먼저 병합한다.
   - 정규화·중복 연결·검증·제외는 union 이후에 수행한다.
   - Lead schema: [`schemas/raw-lead.schema.json`](schemas/raw-lead.schema.json)
4. **Canonicalization**
   - `PLACE`, `SERIES`, `OCCURRENCE`, `OFFER`, `TREND` subject를 식별한다.
   - `lead_subject_links`가 raw lead에서 canonical subject까지의 경로를 보존한다.
   - provider ID, 저장 목록 membership, canonical subject는 별도 기록이다.
5. **Observation and evidence**
   - 일반 카드 필드는 source URL과 `observed_at`을 가진 observation으로 보존한다.
   - chip 근거, 충돌, 가격, 혜택, 희소성, 안전, identity, material trend는 atomic claim으로 보존한다.
   - Schema: [`schemas/evidence-claim.schema.json`](schemas/evidence-claim.schema.json)
6. **Chip support**
   - Evidence 단계의 chip은 `MERIT`, `HEAT`, `SCARCITY`, `PAYOFF`, `SOCIAL_CURRENCY`이다.
   - `PERSONAL_FIT`은 decision context가 있는 추천 단계에서만 계산한다.
   - Schema: [`schemas/claim-chip-support.schema.json`](schemas/claim-chip-support.schema.json)
7. **Trust review**
   - `approve`, `hold`, `reject`, `revise`를 claim ID와 함께 기록한다.
   - Schema: [`schemas/trust-verdict.schema.json`](schemas/trust-verdict.schema.json)
8. **Presentation and recommendation**
   - 공개 카드 필드: [`presentation-contract.md`](presentation-contract.md)
   - 개인화 추천 이유: [`schemas/recommendation.schema.json`](schemas/recommendation.schema.json)
9. **Evaluation**
   - union loss, 성공 경로, 실패 단계와 root cause를 기록한다.
   - Schema: [`schemas/search-run-evaluation.schema.json`](schemas/search-run-evaluation.schema.json)

## 5. 논리 DB schema

공유용 DBML: [`search-backend.dbml`](search-backend.dbml)

DBML은 다음 네 영역을 한 파일에서 표현한다.

| 영역 | 주요 테이블 |
|---|---|
| Run ledger | `search_runs`, `search_workers`, `raw_leads`, `raw_union_memberships`, `lead_subject_links`, `search_run_evaluations`, `post_run_checks` |
| Canonical catalog | `subjects`, `subject_aliases`, `subject_external_ids`, `subject_relations`, `list_collections`, `list_memberships`, `places`, `experience_series`, `experience_occurrences`, `offers`, `trends` |
| Evidence and trust | `subject_observations`, `subject_projection_sources`, `source_snapshots`, `evidence_claims`, `claim_chip_supports`, `trust_verdicts`, `promotion_decisions` |
| Product lineage | `media_assets`, `opportunity_cards`, `decision_contexts`, `recommendation_batches`, `recommendation_instances`, `experience_events`, `experience_outcomes`, `user_opportunity_state` |

DBML은 vendor-neutral logical schema다. Supabase migration, RLS, trigger, index tuning, archive policy를 포함하지 않는다. Account/Profile과 Map/Plan 테이블은 Search 부서 schema의 범위 밖이며 [`../../docs/architecture/database-schema.md`](../../docs/architecture/database-schema.md)에 정의되어 있다.

## 6. 용어 대응

| Search subject | Logical table | 기존 문서 용어 |
|---|---|---|
| `PLACE` | `places` | place |
| `SERIES` | `experience_series` | `events`, series |
| `OCCURRENCE` | `experience_occurrences` | `event_occurrences`, occurrence |
| `OFFER` | `offers` | offer, event offer |
| `TREND` | `trends` | trend thread, market signal |
| Product projection | `opportunity_cards` | `opportunities`, Explore card |

`subjects`는 Search 단계의 공통 identity spine이다. `places`, `experience_series`, `experience_occurrences`, `offers`, `trends`는 kind별 extension이다. `opportunity_cards`는 canonical identity가 아니라 사용자에게 발행되는 presentation snapshot이다.

## 7. 데이터 불변 조건

- raw worker 결과는 union 전에 삭제하거나 덮어쓰지 않는다.
- provider place ID와 canonical subject ID를 동일한 identity로 취급하지 않는다.
- 저장 목록 membership은 subject 속성이 아니라 source provenance다.
- 영구 장소와 날짜가 있는 occurrence를 분리한다.
- 폐업·이용불가·이전·후속 사업자는 삭제 대신 상태와 관계를 보존한다.
- 일반 카드 관측과 material evidence claim을 구분한다.
- source URL, source role, `observed_at` 없이 mutable fact를 현재 사실로 승격하지 않는다.
- 출처 충돌은 덮어쓰지 않고 claim 또는 observation 단위로 보존한다.
- `SCARCITY`는 품질을 의미하지 않는다.
- `PAYOFF`는 수혜자와 획득 조건을 보존한다.
- `PERSONAL_FIT`은 `decision_context_id` 없이 저장하지 않는다.
- specialized catalog table의 현재 필드는 projection이며, `subject_projection_sources`로 provenance observation을 연결한다.
- 공개 `opportunity_cards`는 promotion decision, 대표 media, timing, action, cost, place 또는 market, source refs를 가진다.
- `opportunity_cards`와 public batch는 사용자 context 없이 발행할 수 있다. `why_you_text` 또는 `PERSONAL_FIT`이 있는 `recommendation_instances`는 `decision_context_id`를 가진다.
- recommendation, exposure, save, attendance, outcome lineage는 append-only event로 추적한다.
- raw review text, reviewer identity, private-community content, 권리 불명 미디어를 재게시하지 않는다.

## 8. 현재 파일 구조

```text
ops/search/
  README.md
  constitution.md
  organization.yaml
  presentation-contract.md
  search-backend.dbml
  prompts/
    orchestrator.md
    department-head.md
    discovery-worker.md
    evidence-assembler.md
    trust-reviewer.md
  schemas/
    run-brief.schema.json
    worker-output-envelope.schema.json
    raw-lead.schema.json
    evidence-claim.schema.json
    claim-chip-support.schema.json
    trust-verdict.schema.json
    recommendation.schema.json
    search-run-evaluation.schema.json
  evals/
    regression-cases.yaml
  samples/
    README.md
    2026-08-30-card-10.json
    2026-08-30-card-10.csv
    validate-card-sample.mjs
  pilots/
    2026-08-30-first-company-pilot/
```

## 9. 현재 구현 상태

| 구성 요소 | 상태 |
|---|---|
| 헌법·조직 설정·prompt | tracked |
| Exact context·prompt registry contract | tracked, runtime loader not implemented |
| JSON Schema | tracked |
| Presentation contract | tracked |
| 첫 비생산 pilot bundle | tracked |
| Pilot validator | tracked, Pilot 001 전용 topology 포함 |
| Production dispatcher | not implemented |
| Scheduler | not implemented |
| Operational database | not implemented |
| Product feed | not implemented |
| Regression-isolated worker profile | declared, not implemented |
| Supabase migration·RLS | not implemented |

## 10. Pilot 001 검증

```sh
node ops/search/pilots/2026-08-30-first-company-pilot/validate-run.mjs
node ops/search/pilots/2026-08-30-first-company-pilot/validate-evidence.mjs
node ops/search/pilots/2026-08-30-first-company-pilot/validate-trust.mjs
node ops/search/pilots/2026-08-30-first-company-pilot/validate-policy.mjs
```

Pilot 001 validator의 고정 3+1 worker topology는 해당 pilot 재현용이다. 일반 실행 계약은 `organization.yaml`의 adaptive 1~3 worker 규칙을 따른다.

## 11. DB·service enforcement

DBML이 표현하지 않는 다음 cross-row·conditional 조건은 실제 migration 또는 backend service에서 검사한다.

- `opportunity_cards.published_at` 설정 시 연결된 `promotion_decisions.decision = publish`여야 한다.
- publish decision의 `trust_verdict_id`는 만료되지 않은 `approve` 또는 허용된 `revise`여야 한다.
- published card는 대표 media, timing, action, cost, place 또는 market, source refs를 모두 가져야 한다.
- `why_you_text` 또는 `PERSONAL_FIT`이 있는 `recommendation_instances`는 `decision_context_id`를 가져야 한다.
- material failure에 `corrective_action`이 있으면 `regression_case_id` 또는 `post_run_check_id` 중 하나가 있어야 한다.
- `worker_id`는 run 안에서 유일해야 하고 routine run은 활성 부서별 1~3개 worker를 가져야 한다.

현재 migration과 backend service가 없으므로 위 조건은 아직 실행되지 않는다.

## 12. 관련 문서

- Search 헌법: [`constitution.md`](constitution.md)
- 조직 설정: [`organization.yaml`](organization.yaml)
- 제품 카드: [`presentation-contract.md`](presentation-contract.md)
- 제품 backend 경계: [`../../docs/architecture/database-schema.md`](../../docs/architecture/database-schema.md)
- 추천·경험 이력: [`../../docs/architecture/experience-graph.md`](../../docs/architecture/experience-graph.md)
- 첫 pilot 결과: [`pilots/2026-08-30-first-company-pilot/pilot-result.md`](pilots/2026-08-30-first-company-pilot/pilot-result.md)
