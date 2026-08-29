# MOHAE Database Boundary

> 상태: future backend draft
>
> 현재 prototype은 `localStorage`만 사용한다.
>
> 이전 Life Lab 18-table schema: [`../archive/life-lab-database-schema.md`](../archive/life-lab-database-schema.md)

## 1. 제품 경계

MOHAE backend는 세 영역만 소유한다.

| 영역 | 책임 |
|---|---|
| Account/Profile | 인증 주체, locale, 기본 지역, 공개 범위 |
| Explore | 실제 장소·행사 catalog, 추천 발행, swipe·저장·방문 history |
| Map/Plan | 저장한 추천과 사용자·Agent가 추가한 계획 장소, 방문 순서와 시각 |

개인 건강·생산성 측정 테이블은 이 schema에 두지 않는다.

## 2. 최소 source-of-truth

### Account/Profile

- `user_profiles`: `user_id`, `locale`, `timezone`, `home_region`, `created_at`

### Explore catalog and delivery

- `places`: 실제 장소의 canonical identity와 좌표
- `events`: 여러 회차를 묶는 행사 identity
- `event_occurrences`: 시작·종료·신청 마감이 있는 특정 회차
- `opportunity_cards`: 사용자에게 발행하는 제목·요약·사진·CTA snapshot source
- `recommendation_batches`: 지역·기간·정책별로 발행한 deck
- `recommendation_instances`: 사용자에게 실제 노출 후보가 된 카드와 순위·이유
- `experience_events`: append-only `exposed`, `passed`, `saved`, `unsaved`, `map_opened`, `attended`, `reviewed`
- `user_opportunity_state`: event replay로 만든 현재 저장·방문 상태

### Shared map and itinerary

- `map_places`: 사용자가 지도에 둔 장소. canonical `place_id`가 없을 때 이름과 좌표 snapshot을 직접 보존
- `itineraries`: 날짜 범위와 timezone을 가진 계획 단위
- `itinerary_stops`: itinerary 안의 `map_place_id`, 순서, 방문 예정 시각, 메모

## 3. Map place와 itinerary stop을 나누는 이유

장소와 방문 계획은 다른 사실이다.

```text
명동 숙소라는 장소
    ├─ 9월 3일 체크인
    └─ 9월 6일 짐 찾기
```

`map_places`는 지도 위 대상의 identity를 소유한다. `itinerary_stops`는 특정 여행에서 언제 어떤 순서로 들르는지를 소유한다. 같은 장소를 여러 번 방문해도 좌표를 복제하지 않는다.

`map_places` 최소 필드:

```text
id
user_id
place_id?               canonical place가 있으면 연결
name_snapshot
kind                    accommodation | airport | attraction | restaurant | other
latitude
longitude
source                   user | agent | saved_opportunity
created_at
removed_at?
```

`itinerary_stops` 최소 필드:

```text
id
itinerary_id
map_place_id
position
visit_at?
note?
created_by               user | agent
created_at
removed_at?
```

## 4. Agent mutation 규칙

- WebMCP tool은 browser의 현재 인증과 같은 사용자 범위에서만 쓴다.
- Agent가 좌표를 추가해도 canonical `places` 사실로 자동 승격하지 않는다.
- `source = agent`와 원래 tool call ID를 보존한다.
- 추가·순서 변경·삭제는 append-only map event로 남기고 현재 상태를 재생할 수 있어야 한다.
- tool 성공 응답 전에 visible map과 persisted state를 모두 갱신한다.
- 사용자는 Agent가 추가한 장소를 같은 화면에서 삭제하거나 수정할 수 있어야 한다.

## 5. 추천 신호 경계

추천은 MOHAE 내부 신호만 사용한다.

- 현재 위치·체류 기간·언어·시간·예산 같은 명시적 context
- Explore의 노출·넘김·저장·방문·후기
- map place 주변이라는 현재 요청 context

별도 측정 제품의 수면·운동·집중·금전 데이터는 기본 입력이 아니다. 향후 연결이 필요해도 사용자 opt-in과 별도 계약 없이는 cross-product FK를 만들지 않는다.

## 6. 현재 보류

- 실제 Supabase migration과 RLS
- geocoder provider와 canonical place reconciliation
- 교통수단별 route leg
- itinerary versioning과 collaborative editing
- booking/payment ownership
- ML feature store와 collaborative filtering
