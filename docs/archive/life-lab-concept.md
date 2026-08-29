# Life Lab — Product Concept

> **An AI-powered laboratory for your life.**
>
> 자신에 관한 답을 대신 내리는 AI가 아니라, 사용자와 Agent가 같은 삶의 모델을 관찰·교정·실험하며 함께 배우는 웹 공간.

**문서 상태:** `CONCEPT DRAFT`

**용도:** 제품 방향 공유와 WebMCP 대회 데모 범위 결정

**비용:** 이 문서는 구현 계약이 아니다. 미결정 항목을 제품 코드가 임의로 확정해서는 안 된다.

---

## 1. 핵심 정의

**Life Lab은 습관 점수판이 아니라, 사용자와 Agent가 함께 수정하는 살아 있는 Life Graph다.**

```text
Talk → Observe → Hypothesize → Experiment → Learn → Update
```

제품의 최상위 목적은 사용자를 최적화하는 것이 아니라, 사용자가 다음 세 가지를 더 정확히 하도록 돕는 것이다.

1. 자신이 실제로 관찰한 것과 추측한 것을 구분한다.
2. 자신에 관한 기존 믿음을 검토하고 교정한다.
3. 작고 되돌릴 수 있는 실험으로 더 나은 설명을 찾는다.

### Product thesis

> **AI should not tell you who you are. It should help you discover it.**

### WebMCP thesis

WebMCP는 Agent가 Life Lab의 상태를 읽는 부가 API가 아니다. 사람과 Agent가 **같은 시각 모델을 조회하고, 초점을 이동하고, 가설을 제안하고, 사용자의 교정을 반영하는 협업 표면**이다.

Agent의 텍스트 답변만 남고 Life Graph가 바뀌지 않는다면 핵심 경험은 실패한 것이다.

---

## 2. 이 제품이 해결하는 문제

사람은 자신의 삶을 압축된 기억과 인상으로 설명한다.

- “요즘 집중력이 떨어졌다.”
- “나는 밤에 더 잘 일한다.”
- “운동하면 생산성이 좋아진다.”
- “집에서 혼자 일해야 집중된다.”

그러나 일상에는 수많은 혼동 요인이 있다. 운동한 날 기분이 좋았더라도, 실제 공통 원인은 여유 있는 날이었을 수 있다. 상관관계가 곧 원인은 아니다.

기존 제품은 대체로 두 극단에 머문다.

1. **Habit tracker:** 행동을 기록하고 streak·점수로 환원한다.
2. **AI chat:** 해석과 조언을 텍스트로 주지만 근거와 수정 이력이 사라진다.

Life Lab은 기록과 대화 사이에 **검토 가능한 공유 모델**을 둔다.

```text
기록과 대화
    ↓
관찰된 사실 / 사용자 진술 / Agent 추론 분리
    ↓
Life Graph에서 근거와 관계 검토
    ↓
사용자 교정 또는 작은 실험
    ↓
결과와 함께 모델 갱신
```

---

## 3. 비목표

Life Lab은 다음 제품이 아니다.

- 다섯 영역을 단일 점수로 합산하는 life scorecard
- streak을 유지하는 것이 목적인 habit tracker
- AI가 성격·정체성·질병을 단정하는 진단 도구
- 상관관계를 인과관계처럼 말하는 최적화 엔진
- 모든 대화와 일일 기록을 노드로 만들어 보여주는 지식 그래프
- Agent가 사용자 승인 없이 삶의 모델을 확정하는 자동화 시스템
- 다섯 축이 모든 사람에게 보편적이라고 주장하는 인간 모델

---

## 4. 핵심 인터페이스 — Orange Grid Life Map

### 4.1 전체 화면

메인 화면은 카드가 빽빽한 SaaS 대시보드가 아니라, 넓고 비어 있는 **Orange Grid canvas**다.

```text
                             SLEEP
                       duration · quality
                              │
                              ▼
EXERCISE ─── Energy ──────── YOU ─────── Focus ─── TIME MANAGEMENT
                              │
                            DIET
                              │
                              ▼
                         EXPLORATION
                    experiment · discovery
```

중앙의 `YOU`는 점수나 고정된 정체성이 아니다. **현재 선택된 시점에서 사용자가 검토 중인 삶의 모델의 중심점**이다.

### 4.2 기본 다섯 영역

첫 사용 시 `Sleep`, `Diet`, `Exercise`, `Time Management`, `Exploration`을 그래프 탐색의 기본 입구로 제공한다. 다섯 영역은 모두 daily update를 지원하며, 사용자는 Agent와 대화해 필요한 하위 노드와 새로운 영역을 추가할 수 있다.

화면에서는 다섯 영역을 동급 top-level entry로 배치하지만 내부에서는 같은 schema를 강제하지 않는다.

- **Measured life domains:** Sleep, Diet, Exercise — 목표와 실제 상태·행동을 기록한다.
- **Coordination domain:** Time Management — 날짜별 계획과 반복 행동을 조직한다.
- **Discovery domain:** Exploration — 목표 안팎의 새로운 가능성을 제시하고 시도를 기록한다.

시각적 동등성은 navigation 관계이고, 내부 type은 각 영역이 실제로 수행하는 역할을 보존한다.

#### Sleep

1. **Sleep target:** 앱의 초기 개인 목표값은 8시간이다. 이것은 모든 사람에게 적용되는 의학적 최소선이 아니다. 기록이 쌓이면 개인별로 조정할 수 있다.
2. **Daily sleep log:** 날짜별 실제 수면시간과 이를 계산하는 취침·기상 기록
3. **Knowledge:** 수면에 관한 조사된 정보, 팁, 참고자료
4. **Integrations:** 원하는 경우 Apple Watch 또는 수면 앱을 연결하는 선택적 노드

기록에 따라 조정이 필요하면 Agent가 변경안을 제안하고 사용자가 승인한 뒤 새 목표값을 적용한다.

#### Diet

1. **Calorie baseline and target:** 공식과 사용자 input으로 계산한 하루 권장 kcal와, 감량·유지·증량 목표에 따라 실제 섭취하기로 정한 목표 kcal
2. **Daily intake log:** 사용자가 Agent에게 음식과 양을 text로 입력하면 kcal를 근사 추정한다. 원하면 음식 사진을 근거로 추가할 수 있다.
3. **Knowledge:** 식이에 관한 조사된 정보, 팁, 참고자료
4. **Integrations:** 원하는 식이·건강 서비스를 연결하는 선택적 노드

계산값, 사용자가 승인한 목표값, 음식 기록의 추정값을 서로 다른 상태로 표시해야 한다.

#### Exercise

1. **Today’s plan:** Agent와 대화해 설정한 오늘의 운동. `nSuns`, `5/3/1`, `StrongLifts 5×5` 같은 프로그램 또는 완전한 custom plan을 지원한다.
2. **Daily exercise log:** 실제 운동, 세트·횟수·중량 또는 시간·거리 등의 수행 기록
3. **Knowledge:** 운동 원리, 프로그램 설명, 자세 관련 정보와 참고자료
4. **Integrations:** 원하는 운동·건강 서비스를 연결하는 선택적 노드

운동 프로그램 이름만 선택하는 것과 실제 개인 plan을 생성·수정하는 것은 구분한다.

#### Time Management

1. **Daily time plan:** 날짜별로 사용자가 설정한 시간 계획
2. **Daily actual log:** 계획과 별도로 기록한 실제 시간 사용
3. **Recurring habits:** 사용자가 형성하려는 daily 반복 습관 목록과 수행 기록
4. **Knowledge:** 시간관리·습관에 관한 정보, 팁, 읽을 자료
5. **Integrations:** 원하는 경우 calendar를 연결하는 선택적 노드

#### Exploration

1. **Goal list:** 사용자가 설정한 목표 목록
2. **Goal-aligned:** 목표에 맞아 해볼 만한 활동과 그 이유·설명·참고자료
3. **Adjacent discovery:** 현재 목표와 직접 맞지 않더라도 도움이 될 가능성이 있는 활동
4. **Random discovery:** 목표와 무관하게 세상에서 해볼 만한 활동과 설명

이들은 고정 점수 축이 아니다. 사용자는 `Relationships`, `Work Meaning`, `Environment` 같은 영역을 추가·이름 변경·숨김 처리할 수 있다. 기본 다섯 영역을 삭제할 수 있는지는 아직 미결정이다.

### 4.3 Semantic zoom

노드 클릭은 상세 페이지 이동이 아니라 **의미 수준이 바뀌는 줌**이다.

- **Level 0 — Life Map:** `YOU`와 주요 영역, 현재 중요한 관계만 표시
- **Level 1 — Domain graph:** 선택한 영역의 상태·행동·가설·실험 표시
- **Level 2 — Evidence view:** 특정 노드나 연결의 실제 기록, 대화 근거, 변경 이력 표시

예:

```text
Life Map
  └─ Sleep
      ├─ bedtime consistency
      ├─ late meals
      ├─ morning energy
      └─ Hypothesis: late meal → sleep quality ↓
          └─ evidence timeline / corrections / experiment
```

줌 이후에도 사용자는 breadcrumb 또는 `YOU` 선택으로 전체 지도로 복귀할 수 있어야 한다.

### 4.4 왼쪽 Radar Drawer

왼쪽에는 캔버스 위에 떠 있는 접이식 **Radar Drawer**를 둔다. 이것은 별도 대시보드가 아니라 현재 그래프를 탐색하고 해석하는 계기판이다.

접었을 때:

- 현재 시점
- 활성 영역
- Agent가 제안한 미검토 변경 수
- 진행 중인 실험 수

펼쳤을 때:

- 영역 탐색기
- 시간 범위와 과거/현재 비교
- `Observed / User stated / Agent proposed / Confirmed / Rejected` 필터
- daily record 진입점
- active experiment와 review queue
- `즐겨찾기 / 오늘 새 정보` graph 표시 filter
- 전체 Reference library를 여는 `Explore all`
- `한국어 / English` 언어 선택
- memory 표시 여부

노드의 깊은 내용은 Drawer에 모두 넣지 않는다. 선택 노드의 근거는 Level 2 evidence view에서 보여준다. 그렇지 않으면 Drawer가 다시 전통적인 dashboard가 된다.

### 4.5 핵심 조작

- 노드를 클릭하면 해당 local graph로 줌인한다.
- 노드를 hover/focus하면 최근 변화와 근거 수를 본다.
- 연결을 선택하면 의미, 방향, 근거, 반례, 상태를 본다.
- 사용자는 Agent가 만든 노드와 관계를 확인·수정·거부할 수 있다.
- Agent가 방금 변경한 영역은 짧게 pulse/highlight된다.
- 시간 슬라이더로 과거 모델과 현재 모델을 비교한다.
- 실험 전후는 split view로 비교할 수 있다.
- 사용자가 새 영역을 추가하면 전체 지도는 자동 재배치되지만, 사용자의 수동 배치 의도는 보존한다.

---

## 5. 시각 언어

기준 이미지: `/Users/an/Downloads/0d21d678b8aa8a676a538f1e6c2af77f.webp`

### 유지할 문법

- 화면 전체를 지배하는 강한 orange field
- 미세한 grid 또는 인쇄물 같은 선형 texture
- orange와 black 중심의 극단적 고대비
- 거대한 lowercase neo-grotesk 제목
- 작은 정보의 uppercase monospace
- 넓은 음영 공간과 비대칭 배치
- 얇은 선, 단순한 점, 기호 중심의 그래프
- 장식 카드 대신 canvas 자체가 정보 구조가 되는 구성

### 그대로 복제하지 않을 것

참고 이미지는 화면을 촬영한 사진이라 색에 moiré와 디스플레이 간섭이 포함돼 있다. 이미지 픽셀에서 임의의 orange hex를 고정하면 원본 디자인을 복원한 것이 아니다. 실제 구현 전에 asset 기반 색상 샘플링과 여러 화면에서의 대비 검증이 필요하다.

또한 이미지 한 장만으로 정확한 원본 typeface와 라이선스를 확정할 수 없다. `Helvetica Neue`, `Arial`, `Inter Tight`는 임시 fallback일 뿐 **same font로 확정된 것이 아니다**. 원본 브랜드의 font source 또는 식별·라이선스 확인이 필요하다.

### 접근성 제약

- 검정/주황 색만으로 상태를 구분하지 않고 선 종류·기호·label을 함께 사용한다.
- 점선은 가설, 실선은 확인된 관계처럼 일관된 문법을 유지한다.
- hover에만 정보를 숨기지 않고 keyboard focus와 click에서도 접근 가능해야 한다.
- 움직임 감소 설정에서는 pulse와 canvas transition을 축소한다.

### 언어

- 개인 사용의 초기 기본 언어는 한국어다.
- WebMCP 제출·영어 데모를 위해 `한국어 / English`를 즉시 선택할 수 있다.
- 언어 선택은 onboarding, navigation, Radar Drawer, graph label, form, filter, empty/error state 등 **제품 전체 UI/UX**에 적용한다.
- domain·node type·status와 WebMCP state의 내부 ID는 언어와 분리한다.
- 이 기능은 source 번역 모드가 아니다. Reference library는 한국어 source와 영어 source를 모두 수집하고 각 원문 언어로 표시한다.
- 영어 source가 더 최신인 경우를 놓치지 않기 위해 두 언어를 독립적으로 탐색한다.

---

## 6. Life Graph가 표현하는 것

그래프는 “진짜 인간 모델”이 아니라 **현재까지의 증거와 교정을 기반으로 한 가설 지도**다.

### 6.1 개념 레이어

| Layer | 의미 | 예시 | 기본 표현 |
|---|---|---|---|
| Target / plan | 사용자가 현재 따르기로 정한 기준 또는 계획 | 수면 목표 8시간, 오늘의 5×5 plan | 강조된 operational node |
| Daily record | 사용자가 기록한 원시 사건·측정 | 수면 6.2시간, 운동 40분 | evidence timeline의 점·막대 |
| Observation | 여러 기록 또는 대화에서 드러난 현상 | 오후에 집중이 자주 무너짐 | 일반 노드 |
| User statement | 사용자가 직접 말한 현재 해석 | 일이 재미없어서 집중이 안 됨 | 인용 표시 노드 |
| Memory | 향후 Agent 행동을 바꾸는 확인된 선호·결정·교정 | 야간 회의는 피하고 싶음 | archive marker |
| Reference | 출처·작성일·적용 범위가 있는 일반 정보 | 일정한 기상 시각에 관한 연구·가이드 | reference marker |
| Application proposal | Reference를 사용자 기록에 적용한 Agent 제안 | 최근 기록을 근거로 기상 시각 일관성 검토 제안 | proposal marker |
| Integration | 사용자가 선택한 외부 데이터 연결 | Apple Watch, calendar | connector node |
| Opportunity | Exploration에서 검토할 활동 후보 | 목표 정렬 활동, 무작위 활동 | candidate branch |
| Hypothesis | 아직 검증되지 않은 설명 | 늦은 식사와 수면 질이 관련 있음 | 점선 관계 |
| Confirmed relation | 사용자가 근거를 보고 유지하기로 한 관계 | interruption이 집중 저하와 반복 동반 | 실선 관계 |
| Experiment | 가설을 구분하기 위한 제한된 시도 | coworking에서 같은 작업 3시간 | 분기 branch |
| Outcome | 실험 뒤 관찰된 결과 | 집중 증가, 변화 없음 | 결과 노드 |
| Rejected belief | 사용자가 부정하거나 근거가 약해진 해석 | 혼자 있어야 집중됨 | 흐린 취소선 관계 |

### 6.2 모든 노드와 연결에 필요한 문맥

- **Provenance:** 직접 기록, 사용자 발언, Agent 추론 중 무엇인가
- **Epistemic status:** observed, proposed, confirmed, rejected, superseded
- **Time range:** 언제의 삶을 설명하는가
- **Evidence:** 어떤 기록과 대화가 근거인가
- **Counterevidence:** 맞지 않았던 사례는 무엇인가
- **Ownership:** 누가 만들고 누가 확인했는가
- **Revision history:** 무엇이 왜 바뀌었는가

`confidence 83%` 같은 정밀한 숫자는 실제 통계적 의미가 있을 때만 사용한다. 데이터가 적을 때는 `초기 신호`, `반복 관찰`, `혼재`, `근거 부족`처럼 근거의 성격을 말한다.

### 6.3 원시 기록과 그래프의 관계

모든 daily record를 영구 노드로 만들면 투명해 보이지만 그래프는 즉시 혼잡해진다. 반대로 요약만 보여주면 Agent의 해석을 검증할 수 없다.

현재 권장 구조는 다음과 같다.

```text
원시 daily records / conversation evidence
             ↓ aggregate, never erase provenance
의미 있는 observation / statement / memory
             ↓ propose relationship
hypothesis / experiment / outcome graph
```

즉, 전체 지도에는 의미 있는 모델만 보이고 원시 근거는 줌인했을 때 언제든 확인할 수 있다.

### 6.4 Knowledge 수집 — Radar 패턴 차용

Life Lab의 Knowledge는 두 층으로 분리한다.

1. **Reference:** 출처가 연결된 외부 정보. 학술적으로 확립된 사실뿐 아니라 최신 가설, 실무 관행, 민간의 반복 경험, 개인 경험담도 포함한다.
2. **Application proposal:** 하나 이상의 Reference와 사용자 기록을 연결해 만든 Agent의 개인 적용 제안. Reference 자체나 일반 사실처럼 표시하지 않는다.

Radar에서 확인된 재사용 가능한 수집 패턴은 다음과 같다.

```text
매일 08:00 Asia/Seoul Aside routine
    ↓ canonical DB 선조회
여러 discovery channel의 후보 합집합
    ↓ 공식 원문 확인 + semantic deduplication
server credential로 Supabase 기록
    ↓ processed rows 재조회
post-write audit
```

Radar는 discovery channel과 authoritative source를 구분하고, 불완전한 항목을 사실로 확정하지 않으며, credential이 없으면 fail closed한다. 이 원칙은 Life Lab에도 그대로 적용할 수 있다.

Radar의 현재 구현은 raw candidate 합집합을 실행 중에는 보존하지만 별도 DB ledger로 영속화하지 않고, 검증된 event를 인간 승인 없이 공개 `events` table에 직접 기록한다.

Life Lab도 Knowledge 수집에는 인간 승인 gate를 두지 않는다. 학술적 입증 여부로 후보를 제외하지 않고 수집한 항목을 모두 자동 Reference로 승격한다. 다만 **자동 승격은 사실 인정이나 사용자 적용을 뜻하지 않는다.** 각 항목의 source와 근거 성격을 함께 보존한다.

수집은 두 stream으로 나눈다.

1. **Evergreen baseline:** 다섯 영역을 넓게 훑으며 정설, 최신 가설, 실무 관행, 민간 팁, 경험담을 지속적으로 수집한다.
2. **Active-question:** 현재 Life Graph의 목표, 관찰, 가설, 실험과 관련된 정보를 집중 수집한다.

```text
Evergreen baseline ─┐
                    ├─ Aside daily routine
Active-question ────┘        ↓
                  source-attached raw item
                           ↓ automatic upsert
                       Reference library
                           ↓ combine with user-owned records
                   Application proposal
                           ↓ user review when changing
                     target / plan / confirmed relation
```

최소한 원문 URL, source language, 발견 경로, 작성 주체, 작성·관찰 시각, 주장 내용, 근거 형태를 보존한다. 한국어와 영어 source를 모두 독립적으로 수집하되 번역본으로 서로 대체하지 않는다. 근거 성격은 내부 코드가 아니라 사람이 바로 이해할 수 있는 한·영 chip으로 보여준다. 현재 copy 후보는 다음과 같다.

| 의미 | 한국어 chip | English chip |
|---|---|---|
| 충분히 축적된 근거 | `근거 충분` | `Well supported` |
| 아직 검토 중인 가설 | `아직 연구 중` | `Still emerging` |
| 현장에서 반복 사용 | `현장 사용` | `In practice` |
| 개인·집단 경험 기반 | `경험 기반` | `Experience-based` |
| 자료나 의견이 상충 | `의견 갈림` | `Mixed evidence` |

Chip은 항목을 숨기거나 순위를 낮추는 filter가 아니라 provenance를 읽기 쉽게 압축한 표시다. 정확한 문구는 dogfooding으로 조정할 수 있다.

모든 Reference는 library에 저장한다. Main graph에는 초기에는 다음만 노출한다.

- 사용자가 즐겨찾기한 Reference
- 사용자 기준 오늘 새로 수집된 Reference

`오늘 새 정보`는 `updated_at`이 아니라 최초 `collected_at`의 사용자 local calendar date로 판정한다. 기존 Reference를 다시 확인하거나 수정해도 새 정보로 재표시하지 않는다. 이전 Reference는 `Explore all`에서 탐색한다. 실제 사용 뒤 오늘 수집 항목이 graph를 방해하면 즐겨찾기만 남기는 방향으로 줄일 수 있다. 하루 노출 개수는 아직 미결정이다.

Background collector는 모든 Reference를 자동 저장할 수 있지만 사용자의 target·plan·self-model을 직접 변경하지 않는다. Radar의 browser read-only 구조도 그대로 복사하지 않는다. Life Lab browser는 인증된 사용자의 log와 승인 상태를 쓸 수 있어야 하지만, background collection write는 server credential로 격리한다.

---

## 7. Daily record

다섯 기본 영역은 모두 날짜별 갱신을 지원하지만, 매일 다섯 영역을 모두 입력할 의무는 없다. 기록은 웹에서 약 30초 안에 시작할 수 있어야 하며, 빠른 입력 뒤 원하는 만큼 상세 내용을 추가한다. 미기록은 실패나 값 `0`이 아니라 `unknown`이다.

| 영역 | 기본 daily update | 선택적 상세 |
|---|---|---|
| Sleep | 실제 수면시간 또는 취침·기상 | 주관적 질, 중간 각성, 수면 환경 |
| Diet | 음식과 양을 text로 입력해 kcal 근사 추정 | 음식 사진, 항목별 추정, 사용자 정정 |
| Exercise | 오늘 plan 대비 실제 수행 | 세트·횟수·중량, 시간·거리, 운동 후 상태 |
| Time Management | 날짜별 계획과 실제 시간 사용 | interruption, 작업 맥락, 반복 습관 수행 |
| Exploration | 후보 저장·선택·시도 여부 | 예상과 실제, 배운 것, 다음 질문 |
| Common outcome | 에너지, 집중, 기분, 스트레스 | 자유 메모 |

기록 직후 일어나는 일:

1. 원시 기록이 해당 날짜의 타임라인에 추가된다.
2. 현재 보고 있는 local graph의 target·plan·log 상태가 갱신된다.
3. 직접 측정, 외부 연동, Agent 추정, 사용자 정정을 서로 구분한다.
4. 단일 기록만으로 인과관계를 만들지 않는다.
5. 반복 신호가 생기면 Agent가 관계를 **사실이 아닌 검토할 가설**로 제안한다.
6. 사용자가 확인하기 전까지 제안 상태가 시각적으로 구분된다.

Target과 plan은 daily log와 다르다. 실제 기록이 쌓였다는 이유만으로 목표 수면시간, 목표 kcal, 운동 program, 시간 계획을 조용히 변경해서는 안 된다. Agent가 근거와 변경안을 제시하고, 사용자가 승인한 뒤에만 적용한다.

Daily habit은 독립된 점수판이 아니라 Life Graph를 갱신하는 **관찰과 실행 장치**다.

---

## 8. Conversation과 memory

대화 전체를 그래프에 넣지 않는다. 그래프에 들어갈 수 있는 것은 향후 해석이나 행동을 바꾸는 다음 항목뿐이다.

- 사용자가 직접 확인한 관찰
- 선호와 결정
- Agent 해석에 대한 교정
- 검토 중인 가설
- 승인한 실험
- 기록된 결과

### Memory 원칙

- Agent가 추출했다는 이유만으로 durable memory가 되지 않는다.
- memory에는 원문 근거와 확인 주체가 연결돼야 한다.
- 사용자는 memory를 수정·숨김·삭제할 수 있어야 한다.
- rejected 또는 superseded memory는 현재 모델에서 비활성화하되 변경 이력은 사용자에게 설명 가능해야 한다.
- 민감한 건강·감정·관계 데이터는 기본 공유 범위를 최소화한다.

그래프의 memory node는 대화 저장소 자체가 아니라, **현재 Agent가 향후 상호작용에 사용할 수 있는 확인된 전제의 시각적 포인터**다.

---

## 9. Exploration

Exploration은 목표 달성만 최적화하지 않도록 탐색 범위를 의도적으로 넓히는 영역이다. 다음 네 lane을 기본으로 둔다.

1. **Goal list:** 사용자가 현재 탐색하거나 달성하려는 목표
2. **Goal-aligned:** 목표와 직접 맞는 활동 제안, 제안 이유, 설명, 참고자료
3. **Adjacent discovery:** 목표와 직접 관련되지는 않지만 능력·관점·관계를 넓힐 가능성이 있는 활동
4. **Random discovery:** 개인화와 현재 목표를 약하게 하거나 제거하고 세상에서 해볼 만한 활동을 제시하는 영역

각 후보는 최소한 다음 정보를 가진다.

- 무엇을 하는가
- 왜 이 lane에 나타났는가
- 필요한 시간·비용·장소
- 참고자료 또는 출처
- 사용자의 `save / reject / try` 상태

Exploration 후보는 단순 추천으로 남을 수도 있고, 사용자가 원하면 관찰 가능한 실험으로 전환할 수 있다. 실험으로 전환할 때는 다음 조건을 가능한 한 많이 만족한다.

1. 싸고 되돌릴 수 있다.
2. 안전하고 사용자의 권한 안에 있다.
3. 서로 다른 두 설명을 구분하거나 새로운 정보를 준다.
4. 결과가 예상과 달라도 배움이 남는다.
5. 관찰할 결과와 기간이 사전에 명확하다.

예:

```text
Belief: 집에서 혼자 일해야 집중된다.
Alternative: 장소보다 interruption이 적은 것이 중요할 수 있다.
Experiment: 조용한 coworking space에서 같은 종류의 일을 3시간 수행한다.
Observe: interruption, 집중 지속 시간, 완료 결과, 주관적 에너지.
Learn: 장소·고립·사회적 존재 중 무엇을 다음에 구분할지 결정한다.
```

실험 결과는 사용자를 새 정체성으로 고정하지 않는다. `이번 조건에서는 이렇게 관찰됐다`가 기본 언어다.

---

## 10. Human–Agent collaboration

### 10.1 역할 분리

**사용자**

- 무엇이 중요한지 말한다.
- Agent 해석을 확인·수정·거부한다.
- 실험의 비용과 경계를 승인한다.
- 결과의 실제 맥락을 설명한다.

**Agent**

- 흩어진 기록과 대화에서 검토할 패턴을 찾는다.
- 사실·사용자 진술·추론을 구분한다.
- 반례와 대안 설명을 제시한다.
- 작은 실험을 설계한다.
- 승인된 변경을 WebMCP로 Life Graph에 반영한다.

**Life Lab web**

- 현재 상태와 근거를 구조적으로 보관한다.
- 사람과 Agent에게 같은 모델을 보여준다.
- 변경의 provenance와 revision을 유지한다.
- 사용자의 확인 없이 제안이 확정된 것처럼 보이지 않게 한다.

### 10.2 대표 협업 trace

```text
User: “요즘 왜 집중이 안 되는지 모르겠어.”

Agent → inspect Focus neighborhood
Web   → Focus local graph로 이동
Agent → Late meal → Sleep quality ↓ → Morning focus ↓ 가설 제안
Web   → 점선 관계와 근거 4건 표시

User: “야식보다 일이 재미없는 게 더 큰 것 같아.”

Agent → 기존 가설 약화 제안 + Work meaning observation 추가
Web   → 수정 preview 표시
User  → 확인
Web   → 변경 이력과 사용자 교정 저장

Agent → 두 설명을 구분할 작은 exploration 제안
User  → 범위 수정 후 승인
Web   → active experiment branch 생성
```

사람 혼자라면 기록을 연결하기 어렵고, Agent 혼자라면 맥락을 단정하기 쉽다. 공유 그래프는 이 두 실패를 서로 교정하게 한다.

---

## 11. WebMCP surface

아래 이름은 개념적 capability이며 최종 API 계약이 아니다.

### Read

```text
get_life_map()
inspect_subgraph(domain_or_node, time_range)
inspect_recent_patterns(filters)
inspect_current_goals()
inspect_active_experiments()
inspect_evidence(node_or_edge)
compare_periods(before, after, metrics)
```

### Record

```text
add_daily_record(domain, values, provenance)
add_conversation_observation(text, source)
record_experiment_outcome(experiment, observation)
```

### Propose

```text
propose_observation(claim, evidence)
propose_hypothesis(nodes, relationship, evidence, alternatives)
propose_experiment(hypothesis, intervention, observation_plan, limits)
propose_memory(statement, provenance)
```

### User-authorized state change

```text
confirm_proposal(proposal)
reject_proposal(proposal, correction)
revise_relationship(relation, revision)
activate_experiment(experiment)
add_domain(name, placement)
hide_domain(domain)
```

### View control

```text
focus_subgraph(node_or_domain)
set_time_range(range)
set_graph_filters(filters)
show_comparison(before, after)
```

### 권한 원칙

- 조회와 화면 focus는 낮은 위험 작업이다.
- 새 가설과 실험은 먼저 preview 상태로 만든다.
- memory 확정, 관계 확정, 실험 활성화는 사용자 확인이 필요하다.
- 수면·kcal target과 운동·시간 plan의 변경은 Agent 제안 후 사용자 승인이 필요하다.
- 원시 기록 정정과 memory 삭제의 권한·복구 정책은 별도 결정이 필요하다.
- Tool 호출 성공과 실제 사용자 승인 완료를 구분한다.

---

## 12. WebMCP Challenge 적합성

| 심사 관점 | Life Lab에서 보여줄 증거 |
|---|---|
| WebMCP 활용도 | Agent가 현재 graph와 evidence를 구조적으로 조회하고, 화면 focus·가설 preview·승인된 변경을 도구로 수행 |
| Human–agent collaboration | Agent의 해석을 사용자가 그래프에서 교정하고 그 교정이 다음 추론의 상태가 됨 |
| 실제 문제와 impact | 기억과 인상에 의존하던 자기 이해를 검토 가능한 관찰·가설·실험 loop로 전환 |
| 완성도 | semantic zoom, provenance, 상태 문법, 즉각적인 graph update가 하나의 일관된 경험을 형성 |
| 창의성 | 채팅 assistant나 habit dashboard가 아니라 사람과 Agent가 공동 편집하는 self-model을 제품 중심에 둠 |

참고:

- [Chrome for Developers — WebMCP](https://developer.chrome.com/docs/ai/webmcp)
- [OpenAI — WebMCP Challenge](https://openai.com/webmcp-challenge/)

---

## 13. 대회 데모

데모는 기능 목록이 아니라 하나의 믿음이 바뀌는 과정을 보여줘야 한다.

1. 사용자가 “요즘 왜 집중이 안 되는지 모르겠어”라고 Agent에게 말한다.
2. Agent가 최근 기록과 현재 Life Graph를 조회한다.
3. 웹이 `Focus` 주변 local graph로 자동 확대된다.
4. `Late meal → Sleep quality ↓ → Morning focus ↓`가 점선으로 나타난다.
5. 사용자가 근거를 보고 “일이 재미없는 게 더 큰 것 같다”고 교정한다.
6. Agent가 `Work Meaning` 노드와 대안 가설을 preview한다.
7. 사용자가 수정안을 확인한다.
8. Agent가 작고 되돌릴 수 있는 Exploration을 제안한다.
9. 사용자가 조건을 수정하고 실험을 활성화한다.
10. 미리 준비된 후속 기록을 추가하면 before/after graph와 memory가 갱신된다.

### 데모가 증명해야 하는 것

- Agent는 DOM을 추측해 클릭하지 않고 정식 도구로 웹 상태를 이해한다.
- 화면 변화는 대화의 장식이 아니라 다음 대화의 공통 맥락이다.
- 사용자는 Agent 해석을 거부하고 더 나은 설명을 넣을 수 있다.
- 관찰, 추론, 확인된 관계가 시각적으로 구분된다.
- WebMCP를 제거하면 동일한 협업 경험이 본질적으로 약해진다.

---

## 14. 성공 기준

### 제품 성공

첫 사용자가 다음을 할 수 있다.

1. 30초 안에 daily record를 남긴다.
2. Life Map에서 최근 중요 변화 하나를 찾는다.
3. 관계의 근거와 반례를 확인한다.
4. Agent의 잘못된 해석을 그래프에서 교정한다.
5. 하나의 작은 실험을 승인하고 결과를 기록한다.
6. 실험 전후 자기 모델이 왜 바뀌었는지 설명한다.

### 대회 데모 성공

심사자가 짧은 세션 뒤 다음 문장을 말할 수 있어야 한다.

> “Agent가 분석 결과를 채팅으로 말한 것이 아니라, 사용자와 같은 모델을 함께 보고 수정했다.”

streak 수, 노드 수, 데이터 입력량은 핵심 성공 지표가 아니다.

---

## 15. 이전 [`PI 제품 계약`](../archive/pi-product-contract.md)과의 관계

이 문서는 기존 계약을 조용히 덮지 않는다. 현재 두 방향에는 다음 충돌이 있다.

| 기존 계약 | Life Lab concept | 결정 필요 |
|---|---|---|
| mobile near-white + mint card home | orange full-canvas graph | 교체인지 별도 view인지 |
| 정확히 다섯 고정 슬롯 | 다섯 기본 영역 + 사용자 추가 축·노드 | 고정성의 제거 여부 |
| `GOAL` 슬롯 | Time Management와 Exploration의 goal list | goal의 최종 위치 |
| Exploration은 무관한 무작위 후보 중심 | 목표 정렬·인접·무작위 탐색과 선택적 실험을 함께 제공 | Life Lab에서는 기존 정의를 확장·교체 |
| 오늘의 행동 완료가 홈 중심 | graph 안에서 target·plan·log·memory를 함께 조작 | 제품의 최종 우선순위 |
| 주간 plan 안정성 | graph와 daily state의 지속적 갱신 | 두 시간 주기의 결합 방식 |

현재 Life Lab에서는 **Life Graph가 주 인터페이스이고, daily target·plan·log는 각 영역의 first-class content**다. 이것이 기존 mobile habit product를 교체하는지, 그 위에 새로운 graph mode를 추가하는지는 아직 결정되지 않았다.

---

## 16. 현재 결정 상태

### Confirmed from current direction

- Life Graph가 주 인터페이스이고 chat은 조작 입력 중 하나다.
- 기본 영역은 Sleep, Diet, Exercise, Time Management, Exploration이다.
- 다섯 영역 모두 daily update를 지원하고 Agent를 통해 하위 노드와 새 영역을 추가할 수 있다.
- Sleep은 초기 8시간인 개인 목표값, daily 수면 log, 정보·팁, 선택적 Apple Watch·수면 앱 연동을 기본으로 한다.
- Diet는 공식 기반 권장 kcal, 목표 섭취 kcal, text와 선택적 사진을 이용한 daily 추정 log, 정보·팁, 선택적 연동을 기본으로 한다.
- Exercise는 Agent와 설정하는 오늘의 program/custom plan, daily 수행 log, 운동·자세 정보, 선택적 연동을 기본으로 한다.
- Time Management는 날짜별 계획, 실제 log, 반복 습관, 정보·읽을 자료, 선택적 calendar 연동을 기본으로 한다.
- Exploration은 goal list, goal-aligned 제안, adjacent discovery, random discovery를 기본으로 한다.
- 기록에 따른 target·plan 변경은 Agent가 제안하고 사용자가 승인한 뒤 적용한다.
- 다섯 영역은 daily 입력을 지원하지만 매일 모두 입력할 의무는 없고, 미기록은 실패나 `0`이 아니라 `unknown`이다.
- 측정 UX는 실제 dogfooding을 통해 입력 부담을 계속 줄이는 방향으로 발전시킨다.
- 다섯 영역은 화면에서 동급 top-level entry지만 내부에서는 measured life, coordination, discovery 역할을 가진 typed domain이다.
- 노드 클릭으로 관련 local graph에 semantic zoom한다.
- 왼쪽에 접고 펼치는 Radar Drawer가 있다.
- daily record와 대화에서 확인된 memory가 그래프에 반영된다.
- Knowledge는 출처 기반 Reference와 사용자 기록에 적용한 Agent의 Application proposal로 분리한다.
- Knowledge 수집은 Radar의 Aside daily collection → canonical DB update 패턴을 차용한다.
- 학술적 입증 여부로 Knowledge 후보를 제외하지 않고 최신 가설·실무 관행·민간 팁·경험담까지 모두 자동 Reference로 승격한다.
- Knowledge는 넓은 evergreen baseline과 현재 graph를 따르는 active-question stream으로 수집한다.
- 근거 성격은 쉬운 Korean/English chip으로 표시한다.
- 모든 Reference는 library에 저장하고 main graph에는 초기에는 즐겨찾기와 수집일 기준 오늘 새 정보만 표시하며, `Explore all`에서 전체를 제공한다.
- 한국어를 초기 기본으로 하되 WebMCP 제출을 위해 제품 전체 UI/UX에서 English를 선택할 수 있다.
- Reference는 번역 모드와 분리해 한국어 source와 영어 source를 모두 수집·표시한다.
- 사실, 사용자 진술, Agent 추론, 가설, 거부된 해석을 구분한다.
- Agent와 사용자가 WebMCP를 통해 같은 시각 모델을 함께 수정한다.
- orange grid와 기준 이미지의 타이포그래피 위계를 시각 출발점으로 삼는다.

### Proposed

- 원시 daily record는 전체 graph의 영구 노드가 아니라 evidence layer에 둔다.
- 모든 수집 항목은 source와 discovery provenance를 보존한 채 Reference library에 자동 upsert한다.
- Reference에는 source, source language, author/publisher, publication date, observed date, first collected date, claim, evidence form, scope, freshness를 둔다.
- 근거 chip의 초기 copy는 `근거 충분 / 아직 연구 중 / 현장 사용 / 경험 기반 / 의견 갈림`과 대응하는 English를 사용하고 dogfooding으로 다듬는다.
- `오늘 새 정보`가 graph를 방해하면 main graph를 즐겨찾기 Reference만 표시하도록 줄인다.
- 외부 서비스는 필수 데이터 원천이 아니라 사용자가 선택하는 integration node다.
- memory는 Agent 추출만으로 확정하지 않고 사용자 확인과 provenance를 요구한다.
- Exploration 후보는 추천으로 남거나 사용자가 원할 때 구조화된 실험으로 전환한다.
- target·plan 외의 Agent mutation도 위험도에 따라 preview → user confirm → apply 단계를 따른다.

### Open — Product roots

현재 grill은 세부 데이터 표현을 멈추고 아래 제품 전제부터 결정한다.

1. Life Lab의 첫 번째 가치는 `측정`, `이해`, `탐색·행동` 중 무엇인가?
2. 최우선 성공 기준은 창업자가 실제로 매일 쓰는 도구인가, WebMCP Challenge에서 강한 협업을 보여주는 데모인가?
3. Life Lab은 기존 mobile card 제품을 교체하는가, 그 위에 graph mode로 존재하는가?

### Deferred detail — 현재 grill 대상 아님

- 권장 kcal 공식과 food text·사진 추정의 확정 방식
- daily record의 observation 승격 기준과 confirmed relation 기준
- goal의 graph 위치와 기본 영역 삭제 권한
- evidence chip 최종 copy와 `오늘 새 정보` 노출 개수
- source 언어 우선순위, personal application safety, integration 충돌 처리
- memory privacy·삭제·복구
- exact orange, 원본 font와 라이선스
- 대회 구현 graph depth와 prepared data 범위

---

## 17. Grill ledger

| Question | Status | Current result |
|---|---|---|
| 기본 다섯 영역과 내부 구성은 무엇인가? | DECIDED | 각 영역의 target/plan, daily log, knowledge, integration 또는 exploration lane을 §4.2에 확정했다. |
| Graph에는 무엇을 직접 노드로 남길 것인가? | PARTIALLY DECIDED | 기본 node family는 정했지만 개별 daily record를 primary graph에 직접 노출할지는 미결정이다. |
| 제품의 중심 artifact는 daily plan인가 self-model인가? | DECIDED | Life Graph가 주 인터페이스이며 daily plan과 log는 graph 내부의 first-class content다. |
| 기록이 쌓인 뒤 target과 plan의 변경 권한은 누구에게 있는가? | DECIDED | Agent가 변경안을 제안하고 사용자가 승인한 뒤 적용한다. |
| 다섯 영역은 내부적으로도 같은 종류의 축인가? | DECIDED | 화면에서는 동급 entry지만 내부에서는 역할이 다른 typed domain이다. |
| Knowledge와 개인화 조언을 어떻게 구분하는가? | DECIDED | 출처 기반 Reference와 사용자 기록에 적용한 Application proposal로 분리한다. |
| 다섯 영역을 매일 모두 기록해야 하는가? | DECIDED | 모두 입력 가능하지만 의무는 아니며 미기록은 `unknown`이다. |
| Reference 후보의 DB 승격 gate는 무엇인가? | DECIDED | 인간 승인이나 학술적 입증 filter 없이 모든 항목을 source와 함께 자동 승격한다. |
| daily Knowledge 수집의 탐색 범위는 무엇인가? | DECIDED | evergreen baseline과 active-question stream을 함께 운영한다. |
| 자동 승격된 Reference의 근거 성격을 어떻게 표시하는가? | DECIDED | 쉬운 한·영 chip으로 표시하며 초기 copy는 §6.4에 제안했다. |
| 모든 Reference를 graph에 동시에 표시하는가? | DECIDED | 전부 library에 저장하고 graph에는 즐겨찾기와 오늘 새 정보만, 전체는 `Explore all`에서 표시한다. |
| 제품 언어는 무엇인가? | DECIDED | 한국어 기본이며 제품 전체 UI/UX에서 English를 선택할 수 있다. |
| source도 UI 언어에 맞춰 번역하는가? | DECIDED | 번역 모드가 아니라 한국어·영어 source를 모두 원문 언어로 수집·표시한다. |
| `오늘 새 정보`의 기준은 무엇인가? | DECIDED | 사용자 local date 기준 오늘 최초 수집된 Reference다. |
| 다국어 source의 동일 주장을 어떻게 합치는가? | DECIDED | 하나의 Reference claim 아래 여러 source evidence를 연결하고 내용이 실질적으로 다를 때만 분리한다. |
| 제품의 첫 번째 가치는 측정·이해·탐색 중 무엇인가? | OPEN | `이해`를 중심에 두고 측정은 input, 탐색·행동은 output으로 두는 방식을 권장한다. |
| 최우선 성공 기준은 personal tool인가 challenge demo인가? | OPEN | 실제 daily tool을 우선하고 그 진짜 loop를 대회 demo로 압축하는 방식을 권장한다. |

다음 라운드에서 답이 정해지면 이 문서를 갱신한다. 합의되지 않은 추천은 `Confirmed`로 승격하지 않는다.

---

## 18. UI prototype — DISCARDED

2026-08-28 사용자 요청으로 `design/life-lab-ui-prototype/`, 관련 `.superloopy` evidence, 기존 mobile reference를 포함한 시각 산출물을 전부 폐기했다. Graph, dashboard, orange grid, PetitSeoul theme, near-white mobile card 중 어떤 방향도 현재 활성안이 아니다. 제품 개념과 데이터·권한 결정은 유지하되, 다음 UI prototype은 새 질문과 새 기준에서 시작해야 한다.
