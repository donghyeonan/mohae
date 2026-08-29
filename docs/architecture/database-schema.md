# Life Lab Database Schema

> 상태: MVP 설계 초안  
> 데이터베이스: PostgreSQL / Supabase  
> 시각 문서: [`index.html`](./index.html)

## 1. 현재 제품 경계

Life Lab은 같은 앱과 계정 안에 **Me**와 **Explore**를 함께 두지만, 현재 두 도메인의 데이터 흐름은 분리되어 있다.

| 영역 | 현재 책임 |
|---|---|
| App shell | `auth.users`, `user_profiles`로 계정과 공통 표시 설정을 제공한다. |
| Me | 사용자가 측정 항목을 정의하고 값을 명시적으로 기록하며, 계획 대비 실제 시간 사용을 이해한다. |
| Explore | 장소·상품·행사를 발견하고 Random 또는 Preference로 발행하며, 앱 반응과 실제 경험을 기록한다. |

현재 경계의 규칙:

- Me의 측정값은 Explore 추천의 후보, 가중치, 선택 확률에 사용하지 않는다.
- Explore의 저장·방문·결과는 Me의 측정값을 생성하거나 수정하지 않는다.
- `user_profiles.home_region`은 현재 Explore 추천 알고리즘의 입력이 아니다.
- Me와 Explore의 연결점은 미리 만들지 않는다. 실제 사용 중 구체적인 필요가 확인될 때 별도 계약으로 추가한다.

## 2. 전체 구성

총 18개의 source-of-truth 테이블을 사용한다.

| 모듈 | 테이블 수 | 테이블 |
|---|---:|---|
| App shell + Me | 6 | `user_profiles`, `metric_definitions`, `measurements`, `user_goals`, `plans`, `plan_items` |
| Explore / World | 7 | `discoveries`, `opportunity_cards`, `places`, `products`, `product_offers`, `events`, `event_occurrences` |
| Explore / Delivery | 2 | `recommendation_batches`, `recommendation_instances` |
| Explore / History | 3 | `recommendation_events`, `experiences`, `experience_outcomes` |

## 3. 설계 원칙

### 독립 사실만 테이블이 소유한다

다른 row에서 복원할 수 없는 사실만 별도 테이블로 둔다.

- 현실의 대상과 사용자에게 발행한 추천은 다른 사실이다.
- 앱 안의 반응과 현실에서 일어난 경험은 다른 사실이다.
- 경험과 사용자가 선택적으로 남긴 결과는 다른 사실이다.
- 계획값과 실제 측정값을 같은 row에 덮어쓰지 않는다.

### 원본 신호를 보존한다

- `recommendation_events`, `experiences`는 append-only로 취급한다.
- 저장 여부 같은 현재 상태는 event replay로 계산한다.
- 무응답은 부정 신호가 아니라 unknown이다.

### 장소·상품·행사의 수명과 동일성을 분리한다

- 장소 재방문은 같은 `place_id`를 기준으로 계산한다.
- 상품 재구매는 `product_id`, 판매 가능 기간은 `product_offer_id`가 소유한다.
- 행사 참여는 `event_occurrence_id`, 반복 참여는 상위 `event_id`를 기준으로 계산한다.

## 4. 테이블 책임

### App shell + Me

| 테이블 | 책임 |
|---|---|
| `user_profiles` | 계정별 timezone, locale, 기본 지역 설정. 현재 추천 가중치에는 사용하지 않는다. |
| `metric_definitions` | 사용자가 구성한 측정 항목의 이름, 값 타입, 단위, 집계 규칙. |
| `measurements` | 특정 시점의 실제 관찰값. 미기록은 row가 없는 unknown이다. |
| `user_goals` | 사용자가 중요하게 보는 측정·시간 사용의 선택적 방향. |
| `plans` | 하루·주간 계획의 범위와 상태. |
| `plan_items` | 계획된 시간 블록·행동·목표값. 실제 값은 `measurements`가 소유한다. |

### Explore / World

| 테이블 | 책임 |
|---|---|
| `discoveries` | Radar 또는 수동 수집 원문과 운영자 검토 결과. |
| `opportunity_cards` | 사용자에게 발행할 제목·요약·태그·CTA와 현실 대상 연결. |
| `places` | 지속되는 실제 장소의 정체성. |
| `products` | 판매처 및 판매 기간과 독립된 상품 정체성. |
| `product_offers` | 특정 판매처·지역·기간에서의 상품 이용 가능성. |
| `events` | 여러 개최 회차를 묶는 행사 정체성. |
| `event_occurrences` | 신청 마감·시작·종료가 있는 특정 행사 회차. |

`opportunity_cards`는 `type`에 맞는 subject FK 하나만 가져야 한다.

- `place` → `place_id`
- `product` → `product_offer_id`
- `event` → `event_occurrence_id`

### Explore / Delivery

| 테이블 | 책임 |
|---|---|
| `recommendation_batches` | 사용자에게 발행한 덱의 모드, 유효 후보 수, catalog 시점, 정책 버전. |
| `recommendation_instances` | 실제 선택된 카드, 순위, 조건부 선택 확률, 발행 당시 카드 snapshot. |

초기 추천은 두 모드만 사용한다.

#### Random

- 현재 유효한 모든 Opportunity를 같은 weight로 추출한다.
- 지역·목표·과거 취향을 gate로 사용하지 않는다.
- 서울 사용자에게 제주 쉐어하우스가 나올 수 있다.

#### Preference

- Random과 같은 유효 후보 집합을 사용한다.
- Explore 내부의 저장·실제 경험과 공통 `tags`가 있으면 weight를 높인다.
- 태그가 일치하지 않는 후보도 weight를 0으로 만들지 않는다.
- Me 데이터, collaborative filtering, embedding, ML ranker는 현재 사용하지 않는다.

각 draw의 `selection_probability`를 기록해 Random과 Preference가 만든 데이터를 구분한다. 정확한 과거 후보 목록 재현은 temporal catalog나 별도 candidate ledger가 생길 때까지 보류한다.

### Explore / History

| 테이블 | 책임 |
|---|---|
| `recommendation_events` | 노출·넘김·저장·해제·제거 등 앱 안의 ordered event. |
| `experiences` | 실제 방문·구매·참여. 추천 없이 직접 기록할 수도 있다. |
| `experience_outcomes` | 경험 뒤 선택적으로 남기는 worth-it, 반복 의향, 동행, 메모. |

## 5. Event 순서와 idempotency

클라이언트의 `occurred_at`은 현실에서 행동했다고 주장한 시각일 뿐 상태 replay 순서가 아니다.

1. 클라이언트가 `client_event_id`와 `occurred_at`을 전송한다.
2. PostgreSQL RPC가 인증과 불변식을 검증한다.
3. 서버 sequence가 전역 단조 증가 `event_seq`를 부여한다.
4. 서버가 `recorded_at = clock_timestamp()`를 기록한다.
5. 현재 상태는 `event_seq` 순서로만 replay한다.

Idempotency 규칙:

- `(user_id, client_event_id)`는 unique다.
- 같은 ID와 같은 payload는 기존 event를 반환한다.
- 같은 ID와 다른 payload는 `request_hash` 비교로 거부한다.
- sequence gap은 rollback 때문에 허용한다.

## 6. 신호의 의미

| 원본 신호 | Explore 내부 의미 |
|---|---|
| `saved` | 시도 의도, 중간 양성 |
| `passed + not_now` | 현재 맥락의 선택, 영구 비선호 아님 |
| `removed + not_for_me` | 명시적 개인 비선호, 약한 음성 |
| `removed + duplicate` | 추천 품질 문제, Preference에 사용하지 않음 |
| `removed + expired` | freshness 문제, Preference에 사용하지 않음 |
| `experience` | 실제 행동, 강한 양성 |
| repeat experience | 같은 canonical 대상의 반복, 가장 강한 행동 신호 |
| outcome 없음 | unknown, 불만족으로 해석하지 않음 |

## 7. Tenant 소유권 불변식

RLS와 직접 인덱스를 위해 일부 child table에 `user_id`를 중복 저장한다. 복제값은 composite FK로 부모의 사용자와 같도록 강제한다.

| Child FK | Parent key |
|---|---|
| `measurements.(metric_definition_id, user_id)` | `metric_definitions.(id, user_id)` |
| `measurements.(plan_item_id, user_id)` | `plan_items.(id, user_id)` |
| `plans.(goal_id, user_id)` | `user_goals.(id, user_id)` |
| `plan_items.(plan_id, user_id)` | `plans.(id, user_id)` |
| `plan_items.(metric_definition_id, user_id)` | `metric_definitions.(id, user_id)` |
| `recommendation_instances.(batch_id, user_id)` | `recommendation_batches.(id, user_id)` |
| `recommendation_events.(recommendation_instance_id, user_id)` | `recommendation_instances.(id, user_id)` |
| `experiences.(recommendation_instance_id, user_id, opportunity_card_id)` | `recommendation_instances.(id, user_id, opportunity_card_id)` |

추천 없이 직접 기록한 experience는 `recommendation_instance_id`가 NULL이므로 마지막 composite FK를 건너뛴다.

## 8. PostgreSQL migration에서 추가할 제약

DBML에 모두 표현되지 않는 다음 제약이 필요하다.

- 모든 사용자 소유 `user_id` → `auth.users.id` FK 및 RLS
- `measurements`의 metric 타입에 맞는 값 컬럼 정확히 하나만 허용하는 CHECK
- `opportunity_cards`의 type과 subject FK를 일치시키는 XOR CHECK
- `selection_probability > 0 AND selection_probability <= 1`
- `eligible_count >= 1`, `rank >= 1`
- `recommendation_events` append-only 권한
- event append 전용 server RPC
- `occurred_at`, `recorded_at`, `event_seq`의 의미를 변경하지 않는 API 계약

## 9. 현재 보류

실제 요구가 생길 때까지 다음은 추가하지 않는다.

- 검색, vector ranking, ML feature store
- collaborative filtering과 복잡한 context-aware 추천
- A/B experiment 전용 테이블
- 정확한 후보 집합 ledger와 temporal catalog
- GPS 출석, 자체 예약·결제, 공급자 등록
- materialized taste table
- Me와 Explore 사이의 cross-context FK 또는 자동 갱신

## 10. DBML

```dbml
Enum opportunity_type {
  place
  product
  event
}

Table user_profiles {
  user_id uuid [pk, note: 'references auth.users']
  timezone text [not null]
  locale text [not null]
  home_region text
}

Table metric_definitions {
  id uuid [pk]
  user_id uuid [not null]
  key text [not null]
  name text [not null]
  value_type text [not null, note: 'number | boolean | text | json']
  unit text
  aggregation text
  archived_at timestamptz

  indexes { (id, user_id) [unique] }
}

Table measurements {
  id uuid [pk]
  user_id uuid [not null]
  metric_definition_id uuid [not null]
  plan_item_id uuid
  value_number numeric
  value_boolean boolean
  value_text text
  value_json jsonb
  measured_at timestamptz [not null]
  local_date date [not null]
  timezone text [not null]
  source text [not null, note: 'manual | integration | agent_estimate | correction']
  recorded_at timestamptz [not null]

  Note: 'metric value type에 맞는 값 컬럼 정확히 하나를 사용한다.'
}

Table user_goals {
  id uuid [pk]
  user_id uuid [not null]
  title text [not null]
  status text [not null, note: 'active | paused | achieved | archived']
  starts_on date
  archived_at timestamptz

  indexes { (id, user_id) [unique] }
}

Table plans {
  id uuid [pk]
  user_id uuid [not null]
  goal_id uuid
  title text [not null]
  starts_at timestamptz [not null]
  ends_at timestamptz
  status text [not null]

  indexes { (id, user_id) [unique] }
}

Table plan_items {
  id uuid [pk]
  user_id uuid [not null]
  plan_id uuid [not null]
  metric_definition_id uuid
  title text [not null]
  planned_start timestamptz
  planned_end timestamptz
  target_value jsonb

  indexes { (id, user_id) [unique] }
}

Table discoveries {
  id uuid [pk]
  source text [not null, note: 'radar | manual']
  source_key text [not null]
  source_url text
  source_language text
  source_data jsonb [not null]
  review_status text [not null, note: 'pending | approved | rejected']
  reject_reason text
  opportunity_card_id uuid [ref: > opportunity_cards.id]
  found_at timestamptz [not null]
  checked_at timestamptz [not null]

  indexes { (source, source_key) [unique] }
}

Table opportunity_cards {
  id uuid [pk]
  type opportunity_type [not null]
  title text [not null]
  summary text [not null]
  tags text[] [not null]
  status text [not null, note: 'draft | published | withdrawn']
  place_id uuid [ref: > places.id]
  product_offer_id uuid [ref: > product_offers.id]
  event_occurrence_id uuid [ref: > event_occurrences.id]
  cta_url text
  checked_at timestamptz [not null]

  Note: 'type과 일치하는 subject FK를 정확히 하나만 가진다.'
}

Table places {
  id uuid [pk]
  place_key text [not null, unique]
  name text [not null]
  address text
  latitude numeric
  longitude numeric
  status text [not null]
  checked_at timestamptz [not null]
}

Table products {
  id uuid [pk]
  product_key text [not null, unique]
  brand text
  name text [not null]
  category text
}

Table product_offers {
  id uuid [pk]
  product_id uuid [not null, ref: > products.id]
  seller text [not null]
  area text
  available_from timestamptz
  available_until timestamptz
  status text [not null]
  checked_at timestamptz [not null]
}

Table events {
  id uuid [pk]
  event_key text [not null, unique]
  name text [not null]
  organizer text
  category text
}

Table event_occurrences {
  id uuid [pk]
  event_id uuid [not null, ref: > events.id]
  place_id uuid [ref: > places.id]
  starts_at timestamptz
  ends_at timestamptz
  registration_deadline timestamptz
  status text [not null]
}

Table recommendation_batches {
  id uuid [pk]
  user_id uuid [not null]
  mode text [not null, note: 'random | preference']
  eligible_count integer [not null]
  catalog_as_of timestamptz [not null]
  starts_at timestamptz [not null]
  ends_at timestamptz
  policy_version text [not null]
  issued_at timestamptz [not null]

  indexes { (id, user_id) [unique] }
}

Table recommendation_instances {
  id uuid [pk]
  batch_id uuid [not null]
  user_id uuid [not null]
  opportunity_card_id uuid [not null, ref: > opportunity_cards.id]
  rank integer [not null]
  selection_probability numeric [not null, note: 'conditional probability at this draw']
  reason_summary text [not null]
  card_snapshot jsonb [not null]
  issued_at timestamptz [not null]

  indexes {
    (batch_id, rank) [unique]
    (id, user_id) [unique]
    (id, user_id, opportunity_card_id) [unique]
  }
}

Table recommendation_events {
  id uuid [pk]
  user_id uuid [not null]
  recommendation_instance_id uuid [not null]
  event_type text [not null, note: 'exposed | passed | saved | unsaved | extended | removed | map_opened | route_opened | booking_opened']
  feedback_reason text [note: 'not_for_me | not_now | duplicate | expired | wrong_information']
  effective_until timestamptz
  occurred_at timestamptz
  recorded_at timestamptz [not null, note: 'server clock_timestamp()']
  event_seq bigint [not null, unique, note: 'server sequence; canonical replay order']
  client_event_id uuid [not null]
  request_hash bytea [not null, note: 'reject reused id with different payload']

  indexes { (user_id, client_event_id) [unique] }
}

Table experiences {
  id uuid [pk]
  user_id uuid [not null]
  opportunity_card_id uuid [not null, ref: > opportunity_cards.id]
  recommendation_instance_id uuid
  occurred_at timestamptz [not null]
  recorded_at timestamptz [not null]
  invalidated_at timestamptz
  invalidated_reason text
}

Table experience_outcomes {
  id uuid [pk]
  experience_id uuid [not null, unique, ref: > experiences.id]
  worth_it boolean
  repeat_intent boolean
  companions text
  note text
  recorded_at timestamptz [not null]
}

Ref: measurements.(metric_definition_id, user_id) > metric_definitions.(id, user_id)
Ref: measurements.(plan_item_id, user_id) > plan_items.(id, user_id)
Ref: plans.(goal_id, user_id) > user_goals.(id, user_id)
Ref: plan_items.(plan_id, user_id) > plans.(id, user_id)
Ref: plan_items.(metric_definition_id, user_id) > metric_definitions.(id, user_id)
Ref: recommendation_instances.(batch_id, user_id) > recommendation_batches.(id, user_id)
Ref: recommendation_events.(recommendation_instance_id, user_id) > recommendation_instances.(id, user_id)
Ref: experiences.(recommendation_instance_id, user_id, opportunity_card_id) > recommendation_instances.(id, user_id, opportunity_card_id)
```
