# Life Lab · 내 측정 UI reference pack

구현은 변경하지 않았다. 아래 이미지는 2026-08-29 Aside로 원본 페이지와 직접 이미지 URL을 확인해 저장했다.

## A. 실시간 시간 가치

### 01 · Money Clock

![Money Clock](./01-money-clock.webp)

- Source: https://apps.apple.com/us/app/money-clock-pay-tracker/id6745183612
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/82/9b/d4/829bd46e-cea8-9438-86b4-4af6c97da6d3/TrackEarningsInRealTime2.png/600x1300bb.webp
- 볼 것: 시급 입력, 경과 시간, 누적 금액, 재생 상태를 한 화면에 둔다.

### 02 · Timoney

![Timoney](./02-timoney.webp)

- Source: https://apps.apple.com/sa/app/timoney-time-is-money/id6780381330
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/10/ae/b2/10aeb228-62e3-1d43-32e6-5d24cbaa2660/01_timoney_home.png/600x1300bb.webp
- 볼 것: 큰 실시간 금액 아래에 남은 근무시간과 하루 목표 진행률을 결합한다.

### 03 · Moneyvated

![Moneyvated](./03-moneyvated.webp)

- Source: https://apps.apple.com/us/app/moneyvated-money-income-timer/id6443849595
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource112/v4/78/6f/a1/786fa103-d86a-6dcd-7aa0-230392449d8a/8b325300-5a89-4001-8566-27ea5cf13167_1_65.png/600x1300bb.webp
- 볼 것: 경과 시간과 금액을 같은 시각적 중심에 둬 `시간 × 단가` 관계를 즉시 이해시킨다.

### 04 · Money Timer

![Money Timer](./04-money-timer-behance.jpg)

- Source: https://www.behance.net/gallery/92601731/Money-Timer-Mobile-app-UIUX-design?locale=en_US
- Image: https://mir-s3-cdn-cf.behance.net/project_modules/1400/373c0392601731.5e4ef725e0ea7.jpg
- 볼 것: 전체 시간·금액 hero와 개별 프로젝트별 시간·시급·누적 가치를 연결한다.

## B. 수면·kcal·활동 시각화

### 05 · WHOOP Sleep

![WHOOP Sleep](./05-whoop-sleep.webp)

- Source: https://apps.apple.com/us/app/whoop/id933944389
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/3d/7a/9d/3d7a9da7-ad15-9e68-4322-1eabf9a8225f/iOS-6.9-1320x2868-Vertical-Frame_02-SLEEP.png/600x1300bb.webp
- 볼 것: 한 개의 큰 수면 점수와 그 점수를 만든 네 가지 요인을 계층적으로 분리한다.

### 06 · WHOOP Recovery

![WHOOP Recovery](./06-whoop-recovery.webp)

- Source: https://apps.apple.com/us/app/whoop/id933944389
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/5b/5d/89/5b5d89bf-7b3c-6939-cf22-aec89e63c720/iOS-6.9-1320x2868-Vertical-Frame_03-RECOVERY.png/600x1300bb.webp
- 볼 것: 회복 상태를 색으로 즉시 판단하고 HRV·안정 심박·호흡·수면을 원인으로 읽는다.

### 07 · Apple Fitness Summary

![Apple Fitness Summary](./07-apple-fitness-summary.png)

- Source: https://support.apple.com/guide/iphone/get-started-with-fitness-ipha5dddb411/ios
- Image: https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/ko_KR/936c7a3bb4874951f2e300ffcdb4940f.png
- 볼 것: 하루 목표 ring, 현재 숫자, 시간대별 mini bar를 서로 다른 카드 크기로 표현한다.

### 08 · Lose It! calories

![Lose It calories](./08-loseit-calories.webp)

- Source: https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629
- Image: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/5b/46/f9/5b46f98d-5464-4441-0e1c-087debabe39b/SC-2.jpg/600x1300bb.webp
- 볼 것: 하루 kcal 예산을 `섭취 / 운동 / 남음`으로 분해하고 단백질·섬유질을 작은 progress bar로 보조한다.

## C. 이동·크기 변경 가능한 모듈

### 09 · Apple widget edit / Smart Stack

![Apple widget edit](./09-apple-widget-edit.png)

- Source: https://support.apple.com/en-us/118610
- Image: https://cdsassets.apple.com/live/7WUAS350/images/ios/ios-26-iphone-16-pro-how-to-add-or-edit-widgets-stacks.png
- 볼 것: 길게 눌러 편집 상태에 들어가고, 삭제·추가·순서 변경을 화면 위에서 직접 수행한다.

### 10 · Apple Control Center edit

![Apple Control Center edit](./10-apple-control-center-edit.png)

- Source: https://support.apple.com/guide/iphone/use-and-customize-control-center-iph59095ec58/ios
- Image: https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/ko_KR/62f43e87d1648c62870de7562a7f8e06.png
- 볼 것: 평소 화면을 유지한 채 각 모듈에 삭제점과 우하단 resize handle을 겹쳐 편집 상태를 명확히 만든다.

### 11 · Home Assistant drag-and-drop grid

![Home Assistant drag and drop](./11-home-assistant-drag-drop.gif)

- Source: https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
- Image: https://www.home-assistant.io/images/blog/2024-03-dashboard-chapter-1/drag-and-drop-cards.gif
- 볼 것: 모듈을 section과 grid 안에서 이동시켜 반응형 배치와 위치 기억을 함께 보존한다.

### 12 · Garmin Connect custom dashboard

![Garmin Connect dashboard](./12-garmin-connect-custom-dashboard.jpeg)

- Source: https://www.garmin.com/en-US/newsroom/press-release/wearables-health/garmin-connect-gets-a-new-look-simplified-design-provides-a-more-customized-experience/
- Image: https://s34181.pcdn.co/en-US/newsroom/wp-content/uploads/2024/01/Garmin-Connect-Refresh-hero-image-for-newsroom.jpeg
- 볼 것: 중요한 지표는 큰 `In Focus`, 나머지는 작은 `At a Glance` 타일로 사용자가 우선순위를 정한다.

## 읽을 때 구분할 점

Apple식 편집은 임의 크기로 자유 확대하는 캔버스가 아니다. 정해진 grid와 몇 가지 크기 family 안에서 이동·교체·확장하는 방식이다. 이 제약이 카드 간 정렬과 정보 계층을 유지한다.

현재 요구와 가장 직접적으로 맞는 조합은 다음 세 장이다.

1. `03-moneyvated.webp`: 시간과 금액의 동시 hero
2. `05-whoop-sleep.webp`: 큰 결과와 원인 지표의 계층
3. `10-apple-control-center-edit.png`: 같은 화면 위에서 이동·삭제·크기 변경
