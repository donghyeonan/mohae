# UI Reference Set

> 이미지·영상 원본은 로컬 전용이며 Git에 포함하지 않는다. 아래 경로는 로컬 workspace의 예상 위치와 출처 기록이다.

제품 구조: **Explore / Map / Status**

레퍼런스는 화면을 복제하기 위한 것이 아니라, 현재 제품 개념에 맞는 상호작용과 정보 구조를 추출하기 위한 자료다.

## 1. Explore

파일:
- `explore/tinder-overview.png`
- `explore/tinder-card-flow.png`
- `explore/tinder-swipe-actions.png`
- `explore/tinder-detail-screens.png`

출처:
- https://dribbble.com/shots/21761565-Tinder-App-UI-Redesign

가져올 것:
- 사진이 화면 대부분을 차지하는 한 장의 추천 카드
- 카드 하단의 제목, 핵심 조건, 거리·시간·가격 칩
- 카드에서 상세 화면으로 자연스럽게 확장되는 구조
- 하단 고정 3탭과 카드 위에 떠 있는 행동 버튼

우리 제품에서의 번역:
- 사람 대신 실제로 실행 가능한 공연, 클래스, 모임, 도전 과제를 보여준다.
- 좌/우 의미는 `싫어요/좋아요`가 아니라 `Skip / Curious`로 둔다.
- 핵심 CTA는 `참가`, `저장`, `일정에 넣기` 중 하나만 강조한다.

## 2. Map

파일:
- `map/event-discovery-map.png`
- `map/map-listing-controls.png`

출처:
- https://dribbble.com/shots/24965261-Event-UI-UX-Mobile-App-Design-Discover-Maps-Search-Event
- https://dribbble.com/shots/24364090-slothUI-World-s-Laziest-Design-System-Map-Listing-Mobile-UI

가져올 것:
- 지도를 기본 캔버스로 두고 선택한 핀의 정보를 하단 카드로 노출
- Explore 카드와 Map 하단 카드의 정보 구조 통일
- 지도/목록 전환, 검색, 필터를 한 영역에 모으는 방식

우리 제품에서의 번역:
- 핀을 누르면 `이벤트명 · 시작 시각 · 거리 · 가격 · 잔여석`만 먼저 보여준다.
- 상세 정보는 위로 끌어올리는 bottom sheet에서 제공한다.
- 지도 자체는 별도 추천 엔진이 아니라 Explore 결과의 공간 보기다.

## 3. Status

파일:
- `status/time-and-money-status.png`
- `status/modular-health-bento.png`
- `status/metric-slot-grid.jpg`

출처:
- https://dribbble.com/shots/25975579-Mobile-App-Work-Session-Tracker
- https://dribbble.com/shots/23933692-WellMate-Health-Care-App-Online-Appointment
- https://dribbble.com/shots/27635682-Health-Tracking-App-UI

가져올 것:
- `시간`과 `돈`을 가장 큰 숫자로 동시에 보여주는 상단 카드
- 서로 크기가 다른 모듈형 metric tile
- 한 타일 안에서 현재값, 기준값, 짧은 해석만 보여주는 구조

우리 제품에서의 번역:
- 최상단은 `오늘 쓴 시간 × 시급 = 체감 비용`을 큰 숫자로 표시한다.
- 그 아래 기본 슬롯은 수면, 운동, 식이, 시간 계획, 목표 습관이다.
- 각 슬롯은 하나의 질문만 답한다.
  - 수면: `최소 수면시간 / 어제 실제 수면`
  - 운동: `오늘 A·B·러닝 중 무엇인지 / 수행 여부`
  - 식이: `기준 섭취량 / 어제 섭취량`, 칼로리는 opt-in
  - 시간 계획: `계획 시간 / 실제 사용 시간`
  - 목표 습관: `오늘 필요 행동 / 실행 여부`

주의:
- 모든 것을 합친 단일 wellness score는 만들지 않는다.
- Status는 사용자를 평가하는 dashboard가 아니라 판단을 돕는 snapshot이다.

## 4. Custom metrics

파일:
- `custom-metrics/add-custom-routine.png`
- `custom-metrics/custom-habit-builder.png`
- `custom-metrics/habit-streak-cards.png`

출처:
- https://dribbble.com/shots/27460319-PawMate-Add-Routine-Flow-Weekly-Health-Goals
- https://dribbble.com/shots/26395938-HBIT-Habit-Tracker-App
- https://dribbble.com/shots/27467544-Habit-Streak-Productivity-Goal-Tracker-Mobile-App-UI-UX-Design

가져올 것:
- 유형 선택 → 이름 → 반복 주기 → 입력 시점의 짧은 생성 흐름
- 사용자가 만든 항목도 기본 항목과 같은 카드 규칙으로 표시
- streak와 heatmap은 목표 습관에서만 선택적으로 사용

우리 제품에서의 번역:
- 사용자는 폼부터 시작하지 않고 agent에게 자연어로 말한다.
- agent가 `이름 · 단위 · 입력형 · 주기 · 데이터 소스 · 기준값` 스키마를 제안한다.
- 사용자가 확인하면 Status 슬롯으로 즉시 추가한다.

## 전체 시각 원칙

- Dribbble 샷의 주황·파랑·초록 팔레트는 복제하지 않는다. 제품 색은 별도로 정한다.
- 큰 이미지, 큰 숫자, 짧은 문장, 둥근 카드라는 구성 원칙만 공유한다.
- Explore는 감정적이고 시각적이어도 되지만 Status는 조용하고 판단 가능해야 한다.
- 참고 이미지는 저작권이 있는 외부 디자인이다. 내부 디자인 참고용으로만 사용한다.
