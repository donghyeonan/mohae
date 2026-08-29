# PI — 단일 제품 계약서

이 파일은 PI의 **PRD·동작 계약·최소 데이터 설계·Open Decisions를 합친 단일 기준 문서**다. 별도 PRD, DB 설계서, ADR, API 문서를 만들지 않는다.

**현재 상태: `NOT READY TO IMPLEMENT`**

- `DECIDED`: 사용자와 동작이 합의됐다.
- `PROPOSED`: 합의된 동작을 구현하기 위한 최소 구조다. 구현 전에 검증할 수 있다.
- `OPEN`: 아직 사용자 결정이 필요하다. Agent가 임의로 메우면 안 된다.

## 1. Product contract — DECIDED

PI는 사용자가 처음부터 원하는 것을 정확히 안다고 가정하지 않는다. 두 미래를 비교하게 해 임시 선호를 발견하고, 이를 매일 실행 가능한 다섯 행동으로 낮춘다.

핵심 약속:

> 같은 핵심 습관을 반복하면 목표에 가까워지고, 어제보다 나은 상태를 만든다.

추천 문장만 주는 조언자가 아니라, 사용자가 추가 계획 없이 시작하고 기록할 수 있게 돕는 개인 Agent를 지향한다. 다만 다섯 번의 선택·추천 수락·습관 완료를 사용자의 영구 선호나 성공 증거로 간주하지 않는다.

## 2. Canonical flow — DECIDED

### 최초 설정

1. 사용자가 고민·목표·현재 상황을 자유롭게 입력한다.
2. Agent가 **서로 다른 두 미래 삶**을 구체적으로 제시한다.
3. 사용자는 `A / B / 직접 작성` 중 하나로 응답한다.
4. Agent는 앞선 응답에서 아직 구분되지 않은 가치·대가를 가장 잘 드러내는 다음 두 미래를 만든다.
5. 이 비교를 정확히 5회 진행한다. 직접 작성도 1회 응답으로 센다.
6. 모순처럼 보이는 선택은 하나를 버리지 않고 상황별 조건으로 함께 보존한다.
7. 별도의 선호 요약 확인 없이 첫 주 계획을 생성한다.
8. 사용자가 다섯 카드의 계획을 승인하거나 수정하면 첫 주가 시작된다.

A/B 5회는 모두 **미래 삶의 선호 발견**에만 사용한다. GOAL 병목·행동 선택은 그 뒤 첫 주 계획 과정에서 별도로 진행한다.

### 매일

1. 홈에서 오늘의 다섯 카드를 본다.
2. 카드를 탭해 완료하거나 세부 기록 화면으로 들어간다.
3. 막히면 하단 chat에서 더 작게 분해하거나 계획 수정을 요청한다.
4. 승인된 주간 계획은 그 주 동안 기본적으로 유지된다.

### 주말

1. Agent가 그 주의 기록을 바탕으로 다음 주 변경안을 만든다.
2. 사용자가 선택·승인한 뒤에만 다음 주 계획을 새 버전으로 저장한다.
3. 기존 주간 계획과 기록은 덮어쓰지 않는다.

변경안을 만드는 정확한 평가 규칙은 아직 `OPEN`이다.

## 3. Home content contract — DECIDED / visual contract — OPEN

홈에는 아래 슬롯이 **정확히 하나씩, 이 순서로** 존재한다.

1. 수면
2. 운동
3. 식이
4. GOAL
5. EXPLORATION

2026-08-28 사용자 요청으로 기존 mobile reference, Apple식 near-white card, mint accent, orange graph, dashboard를 포함한 UI 시안을 모두 폐기했다. 현재 활성 reference image, color, layout, viewport, card style은 없다. 다음 visual contract는 새 prototype을 검증한 뒤 결정한다.

하단 chat placeholder `무엇이 막혔나요?`와 홈에서 계산·회고 설명을 과도하게 노출하지 않는 content 원칙은 유지한다. 홈의 시간 가치 숫자의 의미와 계산식은 여전히 `OPEN`이다.

## 4. Card behavior — DECIDED

### 4.1 수면

- 첫 목표는 **8시간의 수면 기회를 확보하는 것**이다. 8시간을 모든 성인의 의학적 최소선으로 주장하지 않는다.
- 기상 목표 시각에서 8시간을 뺀 `불 끄는 마감 시각`을 홈 행동으로 보여준다.
- 수면 카드를 탭한 시각을 실제 취침 로그로 저장한다.
- 다음 아침 실제 기상 시각이 계획과 다르면 사용자가 수정한다.
- 취침·기상 시각으로 날짜별 수면시간을 계산해 로그로 보여준다.
- 14일 기록 후 사용자가 본인에게 맞는 목표 수면시간을 직접 수정한다. 자동 변경하지 않는다.

카페인, 안대, 빛, 온도, 낮잠, 취침 전 음식 등의 내용은 상세 코칭 후보이지 현재의 고정 기본 습관은 아니다.

### 4.2 운동

첫 일정은 금요일 A에서 시작하며 이후 달력 기준으로 반복한다.

```text
A → 러닝 → B → 러닝 → A → …
```

- 빠진 날이 생겨도 기본 달력 순서를 자동으로 밀지 않는다.
- 사용자는 chat으로 `오늘 A로 변경`처럼 당일 운동을 직접 바꿀 수 있다.
- 네 본운동의 최초 중량은 사용자가 한 번 직접 입력한다.
- 운동 카드를 탭하면 대시보드가 아니라 **오늘의 A/B/러닝 루틴**이 바로 열린다.
- 근력운동은 모든 운동과 세트를 한 화면에서 기록한다.
- 실제 수행한 세트·횟수·중량을 저장한다.

#### A

1. 스쿼트: 예정 본세트보다 `+5kg`으로 `1+회` 시도 후 예정 중량 `5×5`
2. 벤치프레스: `5×5`
3. 풀업: `10회 × 3세트`
4. 사레레: `20회 × 3세트`

#### B

1. 데드리프트: 예정 본세트보다 `+5kg`으로 `1+회` 시도 후 예정 중량 `1×5`
2. 오버헤드프레스: `5×5`
3. 딥스: `10회 × 3세트`
4. 사레레: `20회 × 3세트`

`1+회` 강한 세트는 nSuns 전체 프로그램이 아니라 무거운 중량을 한 번 다뤄보는 요소만 차용한다.

- 강한 세트 결과는 기록만 하며 본세트 증량을 바꾸지 않는다.
- 본세트 목표를 모두 달성하면 다음 같은 종목에서 스쿼트·벤치·데드리프트는 `+5kg`, OHP는 `+2.5kg`이다.
- 실패하면 다음 같은 종목에서 동일 중량을 반복한다.
- 풀업·딥스·사레레는 자동 증량하지 않고 실제 수행값만 기록한다.

#### 러닝

- 시간과 거리를 사용자가 직접 입력한다.
- 평균 페이스는 앱이 계산한다.
- 자동 러닝 증량과 GPS 측정은 없다.
- Nike 연동은 v1에서 제외한다.

### 4.3 식이

- 아침 공복체중과 하루 섭취 kcal를 함께 기록한다.
- 사용자는 `김치찌개 1인분, 밥 반 공기, 계란 2개`처럼 음식과 양을 자연어로 입력한다.
- Agent는 항목별 kcal와 합계를 대략 추정해 보여준다.
- 사용자가 확인·수정한 값만 확정 기록으로 저장한다.
- Mac bridge가 꺼지면 음식 원문을 `pending`으로 저장하고, 복구 후 추정한다.
- 기준 kcal는 Mifflin–St Jeor 방식으로 시작한다.
- 유지 kcal에서 감량은 `-300 kcal`, 유지는 `±0`, 증량은 `+300 kcal`로 시작한다.
- 공복체중과 섭취량의 14일 추세를 본 뒤 변경안을 만들며, 사용자 승인 없이 기준을 바꾸지 않는다.

Mifflin–St Jeor는 시작 추정치일 뿐 측정된 대사량이 아니다. 정확한 활동계수와 예외 처리 규칙은 `OPEN`이다.

### 4.4 GOAL

GOAL은 막연한 목표 문장이 아니라 이번 주에 반복할 **시간+구체 작업**이다.

1. Agent가 사용자 원문을 근거로 현재 병목 가설 두 개를 제시한다.
2. 사용자가 이번 주 병목 하나를 선택한다.
3. Agent가 그 병목을 푸는 구체 행동 두 개를 제시한다.
4. 사용자가 한 행동을 선택한다.
5. Agent는 `기존 행동 직후`와 `시간+장소`를 시작 신호 후보로 만들고 사용자 선택을 반영한다.
6. 홈에는 아래 네 요소를 포함한 완전한 한 문장으로 표시한다.

```text
시작 신호 + 구체 작업 + 수행 시간 + 완료 증거
```

예: `퇴근해 책상에 앉으면, 인터뷰 질문지를 30분 수정하고 문서 링크를 남긴다.`

### 4.5 EXPLORATION

- 현재 목표와 취향에 맞추지 않고 의도적으로 무관한 방향을 탐색한다.
- 미리 정한 분야 축을 사용하지 않는다.
- 시간·비용·이동 상한을 두지 않는다.
- 매주 무작위 후보 7개를 생성해 그 주 동안 유지한다.
- 홈에는 오늘의 대표 후보 하나를 보여준다.
- 카드를 탭하면 그 주의 7개 후보 전체를 볼 수 있다.
- 후보를 경험한 뒤 `새로 알게 된 것/느낀 것`을 한 줄 인사이트로 기록한다.
- 추천은 콘텐츠와 직접 행동을 모두 허용한다.

실제 무작위 원천, 재추첨, 안전 제외, 과거 인사이트 반영 규칙은 아직 `OPEN`이다.

## 5. Runtime and degradation — DECIDED

- v1은 iPhone 크기에 맞춘 외부 배포 웹앱이다.
- 웹 주소는 `pi.myeonglog.app`, Mac worker 주소는 `pi-worker.myeonglog.app`이다.
- 기존 명록 Supabase 프로젝트와 이메일 OTP 계정을 재사용한다.
- 첫 사용자는 본인 한 명이다.
- 배포·통신 경로는 명록에서 검증된 최소 패턴만 재사용한다.

```text
iPhone web
   ↓
Vercel web/BFF
   ↓ shared secret
Cloudflare named tunnel
   ↓
Mac worker / Codex
```

- 수면·완료·운동·러닝·공복체중 기록은 Supabase에 저장하므로 Mac bridge가 꺼져도 사용할 수 있다.
- bridge가 꺼지면 chat, 주간 추천, 음식 kcal 추정만 사용할 수 없다.
- 음식 원문은 대기 저장한다.
- 연결 장애 중 Agent가 계획을 변경한 것처럼 보이면 안 된다.
- 연결 복구 후 마지막 승인 plan을 기준으로 동작한다.

명록의 사주 엔진, 리포트 작업 큐, PDF 파이프라인, 전체 모노레포 구조는 재사용하지 않는다.

## 6. Minimum implementation contract — PROPOSED

### 애플리케이션 경계

- Web: 모바일 홈, 카드 상세, 직접 기록, Supabase 세션과 데이터 접근
- Vercel BFF: AI 요청 인증, 입력 검증, Mac worker proxy
- Mac worker: Codex 호출과 `/health`; 공개 요청은 shared secret 없이는 거부
- Supabase: 인증과 사용자별 영속 데이터

AI가 필요 없는 기록은 브리지에 의존시키지 않는다. 별도 큐·이벤트 버스·범용 plugin 구조는 만들지 않는다.

### 최소 DB schema

기존 Supabase의 `public` schema에 아래 네 테이블만 추가한다. 모든 테이블은 RLS를 활성화하고 `user_id = auth.uid()`와 `app_metadata.pi_access = true`를 함께 검사한다.

- `anon`에는 권한을 주지 않는다.
- Data API에서 쓸 `authenticated` 역할에 `SELECT / INSERT / UPDATE`를 명시적으로 `GRANT`한다. v1에서 필요하지 않은 `DELETE`는 허용하지 않는다.
- 정책은 작업별로 나누며, `UPDATE`에는 동일한 소유권 조건을 `USING`과 `WITH CHECK`에 모두 둔다.
- 권한에는 사용자 수정이 불가능한 `app_metadata`만 사용한다. 이 값의 변경은 JWT가 갱신된 뒤 반영된다.
- 모든 `user_id`는 `auth.users.id`를 참조하고, RLS가 필터링하는 `user_id`를 인덱스의 첫 열로 둔다.

근거: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Data API 명시적 grant 변경](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

#### `pi_profiles`

| Field | Type | Contract |
|---|---|---|
| `user_id` | `uuid` PK | `auth.users.id` |
| `objective` | `text` | 현재 open goal 원문 |
| `preference_evidence` | `jsonb` | 최초 입력, 미래 비교 5개, A/B/직접 작성 응답과 조건부 선호 |
| `sleep_target_minutes` | `smallint` | 최초 `480`, 이후 사용자 수정 |
| `wake_time` | `time` | 기본 기상 목표 |
| `body_profile` | `jsonb` | Mifflin 계산에 필요한 사용자 입력과 활동 수준 |
| `calorie_direction` | `text` | `loss / maintain / gain` |
| `calorie_target` | `integer` | 사용자 승인된 현재 kcal |
| `updated_at` | `timestamptz` | 마지막 변경 시각 |

#### `pi_weekly_plans`

| Field | Type | Contract |
|---|---|---|
| `id` | `uuid` PK | 주간 plan ID |
| `user_id` | `uuid` | owner |
| `week_start` | `date` | 사용자 timezone 기준 주 시작일 |
| `version` | `integer` | 같은 주의 append-only 버전 |
| `status` | `text` | `proposed / approved / replaced` |
| `habits` | `jsonb` | `sleep/exercise/diet/goal/exploration` 다섯 키와 card text·설정 |
| `rationale` | `jsonb` | 사용자 원문과 선택에 연결되는 추천 근거 |
| `approved_at` | `timestamptz null` | 사용자 승인 시각 |
| `created_at` | `timestamptz` | 생성 시각 |

제약: `(user_id, week_start, version)`은 unique이며, 같은 주에는 `approved` plan 하나만 허용한다.

#### `pi_daily_logs`

| Field | Type | Contract |
|---|---|---|
| `user_id` | `uuid` | owner |
| `local_date` | `date` | 사용자 timezone의 날짜 |
| `slot` | `text` | `sleep / exercise / diet / goal / exploration` |
| `completed_at` | `timestamptz null` | 완료 시각 |
| `payload` | `jsonb` | 슬롯별 실제 기록 |
| `updated_at` | `timestamptz` | 마지막 수정 시각 |

기본키는 `(user_id, local_date, slot)`이다. `payload`에는 다음을 함께 담는다.

- sleep: 취침·기상 시각과 계산된 시간
- exercise: 수행한 운동·세트·횟수·중량 또는 러닝 시간·거리·평균 페이스
- diet: 공복체중, 확인된 kcal, `pending/confirmed` 음식 원문 배열
- goal: 완료 증거
- exploration: 수행 후보와 한 줄 인사이트

#### `pi_chat_messages`

| Field | Type | Contract |
|---|---|---|
| `id` | `bigint identity` PK | 순서 보존 |
| `user_id` | `uuid` | owner |
| `role` | `text` | `user / agent` |
| `body` | `text` | 원문 |
| `context` | `jsonb` | 사용한 plan, log, 추천 근거와 모델 정보 |
| `created_at` | `timestamptz` | 생성 시각 |

식이 대기열, 운동 세트, exploration 후보를 위한 별도 테이블은 만들지 않는다. 실제 조회·동시성 문제가 확인될 때만 JSON 구조에서 분리한다.

`pi_profiles`의 PK와 `pi_weekly_plans`·`pi_daily_logs`의 복합키는 `user_id` 선두 인덱스를 겸한다. `pi_chat_messages`에는 `(user_id, created_at)` 인덱스 하나만 추가한다.

## 7. Open Decisions — OPEN

다음 항목이 해결되기 전에는 전체 상태를 `READY`로 바꾸지 않는다.

1. EXPLORATION의 실제 무작위 원천, 중복 방지, 후보 교체, 안전 제외, 과거 인사이트 반영
2. 주말 회고가 어떤 기록을 보고 어떤 변경안을 만드는지
3. 홈 시간 가치 숫자의 의미·계산·갱신
4. 수면·식이·GOAL·EXPLORATION 상세 코칭의 정확한 콘텐츠 범위
5. Mifflin 유지 kcal에 사용할 활동계수와 적용 제외 대상
6. Agent prompt, 모델, 컨텍스트 예산, 안전·위기 대응 규칙
7. 운동의 준비운동·통증·부상 시 대체 동작과 안전 안내
8. 완료·거부·수정·인사이트가 이후 추천에 미치는 영향

## 8. Acceptance scenarios

1. 자유 입력 뒤 미래 삶 비교가 정확히 5회 진행되고 매회 `A / B / 직접 작성`이 보인다.
2. 생성된 첫 plan에는 다섯 슬롯이 정확히 하나씩 존재하며 사용자 승인 전에는 활성화되지 않는다.
3. 승인된 plan은 그 주 동안 유지되고, 다음 주 변경안은 사용자 승인 전까지 적용되지 않는다.
4. 홈은 mint 외 유채색과 제거하기로 한 두 설명 문장을 노출하지 않는다.
5. 금요일 A부터 달력 순서가 반복되고, 운동 상세 한 화면에서 전체 수행값을 기록할 수 있다.
6. 수면 로그 14일과 식이 체중·kcal 14일 추세를 볼 수 있으며 기준은 자동 변경되지 않는다.
7. EXPLORATION 상세에는 그 주 후보 7개와 인사이트 입력이 있다.
8. Mac bridge를 끄면 직접 기록은 계속 저장되고 chat·추천·kcal 추정만 명확히 비활성화된다.
9. 모든 PI 데이터는 기존 명록 데이터와 테이블명·RLS로 분리되고 다른 사용자가 읽거나 쓰지 못한다.
10. `OPEN` 항목을 Agent가 암묵적으로 확정하거나 구현하지 않는다.

## 9. Founder doctrine and WebMCP reframing — OPEN

### 현재 명시된 방향

- PI의 최상위 목표는 **개인이 최고의 삶을 살도록 돕는 것**이다.
- 최초 제품은 가치중립적으로 시작하지 않는다. 최초 사용자인 창업자의 오랜 고민과 암묵지를 압축한 공통 헌법을 기본값으로 배포한다.
- 이후 각 사용자의 기록·대화·선택에서 memory와 skill이 쌓이며 개인과 개인 Agent가 함께 발전한다.
- 최초 가치는 `측정`과 `subtraction`이다. 명료한 선택지와 하지 않을 것의 제거를 통해 환경을 바꾼다.
- 시간은 매일 24시간씩 주어지는 희소 자원이다. 사용자가 설정한 시급으로 시간을 환산해 보이는 숫자는 정밀한 경제적 손익이나 행동의 인과적 가치를 주장하지 않는 **인지 장치**다.

### 행동 모델 — PROPOSED

개인은 사건·환경 `x`에 대해 현재 반응 성향에 따라 행동한다. 이 성향은 초기에는 결과와 경험에 따라 변하지만 시간이 지나면 궤적이 안정되어 반응이 예측 가능해진다는 가설을 둔다. PI는 의지력을 비난하기보다 명료한 선택지·측정·환경 변경을 통해 사용자가 마주하는 `x`를 바꾸는 제품을 지향한다. 자유의지 부재를 검증된 과학적 사실로 제품이 주장하는 것과, 이를 환경 설계의 휴리스틱으로 사용하는 것은 구분한다.

### 최초 헌법 후보

- 수면 기회는 최초 8시간으로 시작한다.
- 운동하지 않는 것보다 적절히 운동하는 것이 신체와 정신에 대체로 유익하다.
- 정제당·정제 탄수화물을 줄이고 충분한 단백질과 균형 잡힌 식이를 지향한다.
- 목표에 따른 기준 kcal와 실제 섭취량을 측정하고 인지하는 것 자체가 개선에 도움을 준다.
- 집중은 무엇을 할지만이 아니라 무엇을 하지 않을지 결정하는 것이다.
- 측정하고 직시할 수 있어야 개선할 수 있다.

### 과거 구상에서 회수한 제품 형태

- `시간`: 고정 routine과 수면을 입력하고, 깨어 있는 시간을 시급으로 환산해 시간 가치를 시각화하며 자유 chat을 제공한다.
- `원씽`: 오늘 선택할 후보 세 개를 제시한다.
  1. 개인의 장기 목표·대화·memory를 강하게 사용한 행동
  2. routine과 최소 정보 및 공통 헌법만 사용한 행동·환경
  3. 개인화를 제거한 무작위 가능성
- 사용자가 하나를 선택하면 Agent와 구체화하고 WebMCP를 통해 기록·시각화·실제 수행을 돕는다.
- 식사 대화를 예로 들면 Agent가 음식 원문을 PI 웹에 구조화해 기록하고, 사용자는 기준 kcal와 당일 섭취량을 시각적으로 직시한다.

이 방향은 §3의 `다섯 슬롯이 정확히 하나씩 존재하는 단일 홈` 계약과 충돌한다. 사용자가 명시적으로 교체하기 전까지 기존 계약을 유지한다.

### Decision ledger

| Decision | State | Current issue |
|---|---|---|
| 시간 가치 숫자는 정밀한 손익이 아닌 인지 장치다 | UNDERSTOOD | 정확한 산식과 시간 분류는 별도 결정 필요 |
| 창업자 헌법을 공통 기본값으로 시작하고 사용하며 개인화한다 | UNDERSTOOD | 사용자가 헌법을 거부·수정할 권한은 미결정 |
| 최상위 목표는 개인이 최고의 삶을 살도록 돕는 것이다 | DECIDED | `최고`를 누가 어떤 증거로 판단하는지는 미결정 |
| 환경 `x`를 바꿔 안정된 개인 반응을 바꾼다 | DECIDED | 환경 변경의 구체적 권한과 성공 기준은 미결정 |
| 상위 UI가 Exploitation/Exploration인지 시간/원씽인지 | OPEN | 기존 다섯 카드 홈과도 충돌 |
| 원씽 선택 뒤 WebMCP가 실제로 무엇을 변경하는지 | OPEN | 추천에서 환경 변화로 이어지는 실행 경계 필요 |
| `시간 × 시급`에서 가치 있게 사용한 시간의 판정 기준 | OPEN | 계획된 휴식·고정 routine·미기록 시간을 구분해야 함 |
| 무작위 후보의 시간 규모·안전·비용·권한 경계 | OPEN | 순례길과 오늘 할 행동은 시간 단위가 다름 |
| Agent의 변경·외부 브라우징 권한 | OPEN | WebMCP 권한과 browser Agent 권한을 분리해야 함 |
| WebMCP의 역할은 로그인된 PI 상태를 Agent가 구조적으로 읽고 변경하는 인터페이스다 | TAUGHT | 사용자 teach-back 후 UNDERSTOOD 가능 |
| 커스텀 웹 chat·CLI에서 Codex 로그인을 재사용한다 | OPEN | Codex와 Hermes의 실제 인증·사용 계약을 확인하기 전에는 아키텍처로 가정하지 않음 |
| 로그인된 사용자의 WebMCP 도구 권한과 승인 경계 | OPEN | 페이지 인증, 사용자별 데이터 격리, 변경 확인 방식을 검증해야 함 |
