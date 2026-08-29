# MOHAE — Product Concept

> **Find your next thing in Korea.**
>
> 검색부터 시작하지 않고, 지금 할 만한 경험을 고르는 제품.

**상태:** current direction

**이전 Life Lab 개념:** [`../archive/life-lab-concept.md`](../archive/life-lab-concept.md)

## 1. 제품 정의

MOHAE가 답하는 질문은 하나다.

> 한국에 있는 내가 다음에 무엇을 할까?

초기 사용자는 한국인과 방한 외국인이다. 여기서 global은 전 세계 장소를 동시에 다룬다는 뜻이 아니라, **한국에 있는 여러 언어와 배경의 사용자가 같은 경험 catalog를 이용한다는 뜻**이다.

핵심 흐름:

```text
상황과 최소 선호
    ↓
한 장씩 판단 가능한 경험 카드
    ↓ pass / save
저장 지도와 실제 방문
    ↓
다음 추천에 쓰이는 MOHAE 내부 신호
```

수면·운동·집중·시간가치 같은 개인 측정은 별도 제품 문제다. MOHAE의 추천은 그 데이터에 의존하지 않는다.

## 2. 두 제품 표면

### Explore — 핵심 제품

- 장소·행사·클래스·활동을 한 장씩 보여준다.
- 사용자는 좌우 스와이프로 `pass / save`를 결정한다.
- 저장한 후보는 지도에서 공간적으로 검토한다.
- `save`, 실제 방문, 선택적 후기는 다음 추천에 쓰이는 제품 내부 신호다.
- 숙소·공항·명소처럼 추천 catalog 밖의 장소도 계획 기준점으로 지도에 추가할 수 있다.

### Profile — 보조 표면

- 로그인과 계정 연결
- 언어와 기본 지역
- 계정 수준의 개인정보와 데이터 연결 범위
- 향후 명시적으로 입력하는 추천 선호의 관리

Profile은 측정 dashboard가 아니다. 현재 prototype의 로그인과 설정은 경계만 보여주는 placeholder이며 실제 auth는 연결하지 않았다.

## 3. Cold start와 개인화

제품 분리가 신호 제거를 뜻하지 않는다. MOHAE는 자기 목적에 필요한 신호를 직접 수집한다.

### 첫 사용의 명시적 맥락

- 현재 위치 또는 출발 지역
- 가능한 날짜와 시간
- 예산과 동행
- 관심 있는 활동
- 방한 사용자의 체류 기간, 숙소 지역, 언어, 이동·예약 제약

초기 입력은 추천을 시작하는 데 필요한 최소한만 요구한다. 모든 항목을 onboarding gate로 만들지 않는다.

### 사용 중 행동 신호

- 카드 노출과 넘김
- 상세 열람
- 저장과 저장 해제
- 지도에서 선택한 장소
- 실제 방문
- 선택적 후기와 명시적 거절 이유

`pass`는 영구적 비선호가 아니라 현재 맥락의 선택이다. 미방문과 후기 없음은 부정 신호가 아니라 unknown이다.

## 4. 지도는 공유 계획판이다

지도에는 서로 다른 두 대상이 함께 보인다.

1. **Saved opportunity:** MOHAE 추천에서 저장한 경험
2. **Planned stop:** 사용자 또는 Agent가 추가한 숙소·공항·명소·식당 등의 계획 기준점

Planned stop은 이름, 종류, 좌표, 선택적 방문 시각·순서·메모를 가진다. 이 구조만으로도 Agent는 여러 장소를 지도에 기록하고 시간순 동선 초안을 만들 수 있다.

현재 prototype은 실제 경로 최적화를 하지 않는다. 좌표를 지도에 표시하고 catalog 안의 주변 추천을 거리순으로 찾는 데까지만 구현한다.

## 5. WebMCP 협업

WebMCP는 숨은 추천 API가 아니라 사람과 Agent가 **같은 지도와 Explore 화면을 함께 바꾸는 표면**이다.

현재 imperative tools:

| Tool | 효과 |
|---|---|
| `get_map_context` | 현재 계획 장소와 저장한 경험을 읽는다. |
| `add_map_stop` | 숙소·공항·명소 등을 지도와 방문 순서에 추가한다. |
| `focus_map_place` | 지정한 장소를 실제 화면의 지도에서 선택한다. |
| `recommend_near_place` | 한 장소 주변의 현재 catalog 후보를 읽는다. |
| `explore_near_place` | 지정한 장소 주변 후보로 swipe deck을 전환한다. |

대표 trace:

```text
User: “인천공항과 명동 숙소를 지도에 넣고, 숙소 근처에서 저녁에 할 일을 찾아줘.”
Agent → add_map_stop(airport)
Web   → 공항 핀과 계획 순서 표시
Agent → add_map_stop(accommodation)
Web   → 숙소 핀과 계획 순서 표시
Agent → recommend_near_place(accommodation)
Agent → 조건에 맞는 후보 설명
Agent → explore_near_place(accommodation)
Web   → 숙소 주변 swipe deck으로 전환
```

### 권한 원칙

- 읽기 도구는 상태를 바꾸지 않는다.
- 장소 추가와 화면 전환은 실행 결과가 즉시 보이는 UI 상태를 남긴다.
- Agent가 추가한 장소는 지도에서 사용자가 삭제할 수 있다.
- WebMCP annotation은 권한 강제가 아니다. 실제 auth·authorization·validation은 앱이 소유해야 한다.
- WebMCP가 없는 브라우저에서도 사람용 interface는 계속 작동해야 한다.

## 6. 현재 prototype의 비목표

- 실제 로그인과 계정 동기화
- 건강·생산성·금전 측정
- 검색창 중심의 장소 검색
- 전 세계 지역 catalog
- 실제 지도·geocoding·교통 경로 계산
- 자동 예약과 결제
- 복잡한 ML ranker 또는 collaborative filtering

## 7. 다음에 결정해야 할 제품 질문

- 첫 반복 사용자를 한국 거주자와 단기 방한객 중 누구로 좁힐 것인가?
- 방한객에게 반드시 필요한 접근성 정보는 언어, 예약 가능성, 교통 중 어디까지인가?
- 저장 지도와 날짜별 itinerary를 같은 화면에서 언제 분리할 것인가?
- 실제 장소·행사 catalog를 누가 어떤 freshness 계약으로 공급할 것인가?
