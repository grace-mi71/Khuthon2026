# 요구사항 문서

## 소개

딴길 로컬 웹 애플리케이션의 프론트엔드 디자인 시스템 구축 및 UI 폴리싱 요구사항이다. 현재 프로토타입 수준의 비주얼(이모지 아이콘, 단순 레이아웃)을 완성도 높은 디자인으로 전환하고, 미구현 UI 컴포넌트를 추가하며, 전체 페이지에 걸쳐 일관된 시각적 경험을 제공하는 것을 목표로 한다.

## 용어 정의

- **Design_System**: 딴길 로컬 웹 앱 전체에 적용되는 타이포그래피, 컬러, 스페이싱, 컴포넌트 규칙의 집합
- **Recommendation_Card**: 추천 결과를 표시하는 카드 UI 컴포넌트로, 추천 이유·로컬 딴길 이유·이동 부담 비교를 포함
- **Ddangil_Index_Slider**: 사용자가 익숙함과 낯섦의 정도를 1~5 단계로 조절하는 슬라이더 UI
- **Travel_Burden_Card**: 멀리 있는 유행 경험과 로컬 딴길의 이동 시간·비용·대기시간을 비교하는 카드 UI
- **Local_Taste_Sentence**: 사용자의 저장 기록을 기반으로 생성된 취향 문장을 표시하는 UI
- **Ddangil_Signal**: 지역 provider에게 전달되는 익명 집계 데이터를 시각화하는 UI
- **Micro_Interaction**: 사용자 인터랙션에 반응하는 CSS 애니메이션 및 트랜지션 효과
- **Onboarding_Flow**: /register 페이지의 회원가입 과정 시각 디자인
- **Bottom_Sheet**: 화면 하단에서 올라오는 모달 형태의 UI 컴포넌트
- **Page_Transition**: 페이지 간 이동 시 적용되는 애니메이션 효과

## 요구사항

### 요구사항 1: 디자인 시스템 정립

**사용자 스토리:** 프론트엔드 개발자로서, 일관된 디자인 시스템을 정립하고 싶다. 그래야 모든 페이지에서 통일된 시각적 경험을 제공할 수 있다.

#### 인수 조건

1. THE Design_System SHALL 타이포그래피 스케일을 정의하되, 제목(h1~h3), 본문(body), 캡션(caption), 라벨(label) 각각에 font-size, font-weight, line-height, letter-spacing 값을 명시한다
2. THE Design_System SHALL 스페이싱 스케일을 4px 단위 기반으로 정의하여 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px 값을 CSS 변수로 제공한다
3. THE Design_System SHALL 기존 컬러 시스템(green primary #2A5C32, orange accent #D4673A, cream background #F5F4F0)을 유지하면서 semantic color token(success, warning, error, info)을 추가한다
4. THE Design_System SHALL 모든 인터랙티브 요소에 대해 default, hover, active, focus, disabled 상태별 스타일을 정의한다
5. THE Design_System SHALL 모바일 퍼스트(max-width: 480px) 기준을 유지하면서 컴포넌트별 반응형 동작 규칙을 정의한다

---

### 요구사항 2: 온보딩/회원가입 플로우 디자인

**사용자 스토리:** 신규 사용자로서, 시각적으로 매력적이고 직관적인 회원가입 과정을 경험하고 싶다. 그래야 서비스에 대한 첫인상이 좋아진다.

#### 인수 조건

1. THE Onboarding_Flow SHALL 딴길 로고를 이모지가 아닌 커스텀 타이포그래피 또는 SVG 로고로 표시한다
2. THE Onboarding_Flow SHALL 각 입력 필드에 진입 시 순차적 페이드인 애니메이션을 적용하여 시각적 흐름을 제공한다
3. WHEN 사용자가 필수 입력 필드를 모두 채웠을 때, THE Onboarding_Flow SHALL "딴길 시작하기" 버튼을 비활성 상태에서 활성 상태로 시각적으로 전환한다
4. IF 유효성 검사에 실패하면, THEN THE Onboarding_Flow SHALL 해당 입력 필드에 에러 상태 스타일(빨간 테두리, 에러 메시지)을 표시한다
5. THE Onboarding_Flow SHALL 서비스 소개 일러스트레이션 또는 그래픽 요소를 포함하여 딴길 서비스의 정체성을 전달한다

---

### 요구사항 3: 홈 화면 비주얼 폴리싱

**사용자 스토리:** 기존 사용자로서, 홈 화면에서 서비스의 브랜드 아이덴티티를 느끼고 주요 기능에 쉽게 접근하고 싶다. 그래야 서비스를 자주 사용하게 된다.

#### 인수 조건

1. THE Design_System SHALL 홈 화면의 메뉴 아이템 아이콘을 이모지 대신 커스텀 아이콘(SVG 또는 아이콘 컴포넌트)으로 교체한다
2. THE Design_System SHALL 홈 화면 히어로 영역에 서비스 정체성을 나타내는 일러스트레이션 또는 그래디언트 배경을 적용한다
3. WHEN 사용자가 메뉴 아이템을 탭하면, THE Design_System SHALL 탭 피드백 애니메이션(scale 또는 ripple 효과)을 0.15초 이내에 표시한다
4. THE Design_System SHALL 메뉴 카드 간 시각적 계층 구조를 명확히 하여 "딴길 찾기"가 가장 눈에 띄도록 강조한다

---

### 요구사항 4: 딴길 찾기 페이지 UI 개선

**사용자 스토리:** 사용자로서, 딴길 찾기 과정이 시각적으로 매끄럽고 단계별 진행 상황을 파악하고 싶다. 그래야 복잡한 입력 과정이 부담스럽지 않다.

#### 인수 조건

1. THE Design_System SHALL "요즘 뜨는 딴길" 트렌드 카드에 이모지 대신 카테고리별 일러스트 또는 그래디언트 썸네일을 적용한다
2. WHEN 사용자가 트렌드 카드를 선택하면, THE Design_System SHALL 선택된 카드에 체크 표시와 함께 border 강조 애니메이션을 적용한다
3. THE Design_System SHALL 칩(chip) 컴포넌트의 선택/비선택 상태 전환에 0.15초 이내의 트랜지션 애니메이션을 적용한다
4. THE Design_System SHALL 조건 설정 영역의 각 필드 그룹에 시각적 구분(카드 또는 구분선)을 적용하여 정보 계층을 명확히 한다
5. THE Design_System SHALL 입력 진행 상황을 나타내는 시각적 인디케이터(프로그레스 바 또는 스텝 표시)를 페이지 상단에 표시한다

---

### 요구사항 5: 딴길 지수 슬라이더 경험 개선

**사용자 스토리:** 사용자로서, 딴길 지수를 조절할 때 현재 선택한 값의 의미를 직관적으로 이해하고 싶다. 그래야 원하는 수준의 추천을 받을 수 있다.

#### 인수 조건

1. THE Ddangil_Index_Slider SHALL 슬라이더 트랙에 그래디언트 색상(익숙한 쪽은 연한 초록, 새로운 쪽은 진한 초록 또는 오렌지)을 적용한다
2. WHEN 사용자가 슬라이더 값을 변경하면, THE Ddangil_Index_Slider SHALL 현재 값에 해당하는 설명 텍스트를 0.2초 이내에 페이드 전환한다
3. THE Ddangil_Index_Slider SHALL 각 단계(1~5)에 해당하는 위치에 시각적 스텝 마커(점 또는 눈금)를 표시한다
4. THE Ddangil_Index_Slider SHALL 썸(thumb) 크기를 터치 타겟 최소 44px × 44px로 설정하여 모바일 조작성을 보장한다
5. WHEN 사용자가 슬라이더를 조작하면, THE Ddangil_Index_Slider SHALL 슬라이더 상단 디스플레이 영역의 배경색을 현재 단계에 맞게 동적으로 변경한다

---

### 요구사항 6: 추천 결과 카드 UI 재설계

**사용자 스토리:** 사용자로서, 추천 결과를 볼 때 왜 이 장소가 추천되었는지, 왜 로컬 딴길인지를 한눈에 파악하고 싶다. 그래야 추천에 대한 신뢰가 생긴다.

#### 인수 조건

1. THE Recommendation_Card SHALL 카드 상단 썸네일 영역에 이모지 대신 장르별 일러스트 또는 그래디언트 배경을 적용한다
2. THE Recommendation_Card SHALL "왜 추천됐나요?" 섹션을 포함하여 유행 감각 태그와 로컬 콘텐츠 태그의 연결 관계를 시각적으로 표시한다
3. THE Recommendation_Card SHALL "왜 로컬 딴길인가요?" 섹션을 포함하여 해당 콘텐츠의 지역성·독립성을 1~2문장으로 설명한다
4. THE Recommendation_Card SHALL 이동 시간, 예상 비용, 딴길 지수를 아이콘과 함께 하단 메타 정보 영역에 표시한다
5. THE Recommendation_Card SHALL 2열 그리드 레이아웃에서 1열 풀 카드 레이아웃으로 변경하여 정보 가독성을 높인다
6. WHEN 추천 결과가 로딩 중일 때, THE Recommendation_Card SHALL 스켈레톤 UI를 표시하여 로딩 상태를 시각적으로 전달한다

---

### 요구사항 7: 이동 부담 비교 카드 구현

**사용자 스토리:** 사용자로서, 멀리 있는 유행을 직접 가는 것과 로컬 딴길을 비교하여 실질적인 이점을 확인하고 싶다. 그래야 로컬 딴길을 선택할 동기가 생긴다.

#### 인수 조건

1. THE Travel_Burden_Card SHALL 멀리 있는 유행 경험의 왕복 이동 시간, 예상 교통비, 예상 대기시간을 좌측 열에 표시한다
2. THE Travel_Burden_Card SHALL 현재 지역의 딴길 이동 시간, 예상 비용, 대기시간을 우측 열에 표시한다
3. THE Travel_Burden_Card SHALL "줄어드는 부담" 영역에서 시간 절약량과 비용 절약량을 강조 색상으로 표시한다
4. THE Travel_Burden_Card SHALL 좌우 비교 레이아웃에 시각적 구분선 또는 VS 아이콘을 배치하여 비교 구조를 명확히 한다
5. WHEN 추천 결과 카드 하단에 배치될 때, THE Travel_Burden_Card SHALL 추천 카드와 시각적으로 연결된 형태(같은 카드 내부 또는 연결선)로 표시한다

---

### 요구사항 8: 로컬 취향 문장 UI 구현

**사용자 스토리:** 사용자로서, 나의 문화 취향이 문장으로 표현된 것을 보고 싶다. 그래야 나의 취향을 인식하고 공유할 수 있다.

#### 인수 조건

1. THE Local_Taste_Sentence SHALL 나의 딴길 서랍 페이지 상단에 카드 형태로 취향 문장을 표시한다
2. THE Local_Taste_Sentence SHALL 취향 문장 텍스트에 서체 크기 1.1rem 이상, 행간 1.8 이상을 적용하여 가독성을 확보한다
3. THE Local_Taste_Sentence SHALL 카드 배경에 따뜻한 그래디언트 또는 일러스트 패턴을 적용하여 특별한 느낌을 전달한다
4. WHILE 저장된 딴길이 3개 미만일 때, THE Local_Taste_Sentence SHALL "딴길을 더 저장하면 취향 문장이 만들어져요"라는 안내 메시지를 표시한다
5. WHEN 사용자가 취향 문장 카드를 길게 누르면, THE Local_Taste_Sentence SHALL 공유 옵션(이미지 저장, 링크 복사)을 Bottom_Sheet로 표시한다

---

### 요구사항 9: 딴길 시그널 UI 구현

**사용자 스토리:** 지역 provider로서, 내 공간이 어떤 유행 감각으로 발견되었는지 확인하고 싶다. 그래야 다음 기획에 활용할 수 있다.

#### 인수 조건

1. THE Ddangil_Signal SHALL 발견 횟수를 큰 숫자 타이포그래피로 강조하여 표시한다
2. THE Ddangil_Signal SHALL 주요 유입 감각 태그를 칩 형태로 나열하되, 빈도순으로 정렬한다
3. THE Ddangil_Signal SHALL 주요 출발 유행 목록을 아이콘과 함께 리스트 형태로 표시한다
4. THE Ddangil_Signal SHALL 평균 이동 부담 절감량을 시각적 그래프(바 차트 또는 비교 인포그래픽)로 표시한다
5. THE Ddangil_Signal SHALL 카드 형태의 대시보드 레이아웃으로 구성하여 한눈에 핵심 지표를 파악할 수 있게 한다

---

### 요구사항 10: 마이크로 인터랙션 및 애니메이션

**사용자 스토리:** 사용자로서, UI 조작 시 즉각적이고 자연스러운 피드백을 받고 싶다. 그래야 앱이 반응적이고 세련되게 느껴진다.

#### 인수 조건

1. WHEN 사용자가 버튼을 탭하면, THE Micro_Interaction SHALL 0.1초 이내에 scale(0.97) 축소 후 복원되는 탭 피드백을 제공한다
2. WHEN 페이지가 로드되면, THE Micro_Interaction SHALL 주요 콘텐츠 블록에 아래에서 위로 페이드인(translateY + opacity) 애니메이션을 순차적으로 적용한다
3. WHEN Bottom_Sheet가 열리면, THE Micro_Interaction SHALL 하단에서 슬라이드업 애니메이션(0.3초, ease-out)과 오버레이 페이드인을 동시에 적용한다
4. WHEN 칩 또는 카드의 선택 상태가 변경되면, THE Micro_Interaction SHALL 배경색과 테두리 색상에 0.15초 이내의 트랜지션을 적용한다
5. THE Micro_Interaction SHALL 모든 애니메이션에 prefers-reduced-motion 미디어 쿼리를 적용하여 모션 감소 설정 사용자에게는 애니메이션을 비활성화한다
6. WHEN 추천 결과가 표시될 때, THE Micro_Interaction SHALL 카드가 순차적으로(stagger 0.08초 간격) 나타나는 애니메이션을 적용한다

---

### 요구사항 11: 나의 딴길 서랍 페이지 디자인 개선

**사용자 스토리:** 사용자로서, 저장한 딴길 목록을 시각적으로 풍부하게 보고 관리하고 싶다. 그래야 저장한 콘텐츠를 다시 찾아보는 즐거움이 있다.

#### 인수 조건

1. THE Design_System SHALL 나의 딴길 카드에 이모지 대신 장르별 컬러 아이콘 또는 썸네일 이미지를 적용한다
2. THE Design_System SHALL 카드 삭제 시 좌측 스와이프 제스처를 지원하고, 삭제 확인 영역을 빨간색 배경으로 표시한다
3. THE Design_System SHALL 공개/비공개 상태를 토글 스위치 형태로 변경하여 직관적인 조작을 제공한다
4. WHEN 저장된 딴길이 없을 때, THE Design_System SHALL 빈 상태 일러스트레이션과 함께 "딴길 찾기" 페이지로의 CTA 버튼을 표시한다
5. THE Design_System SHALL 저장 날짜별 그룹핑 또는 장르별 필터링 옵션을 제공한다

---

### 요구사항 12: 커뮤니티(다른 사람들의 딴길) 페이지 디자인 개선

**사용자 스토리:** 사용자로서, 다른 사람들이 발견한 딴길을 시각적으로 매력적인 형태로 탐색하고 싶다. 그래야 새로운 딴길을 발견하는 재미가 있다.

#### 인수 조건

1. THE Design_System SHALL 커뮤니티 카드의 썸네일 영역에 이모지 대신 장르별 컬러 그래디언트 또는 아이콘을 적용한다
2. THE Design_System SHALL 좋아요 버튼에 탭 시 하트 팝업 애니메이션(scale bounce)을 적용한다
3. THE Design_System SHALL 필터 칩 영역을 상단 고정(sticky)으로 변경하여 스크롤 시에도 필터 접근이 가능하게 한다
4. THE Design_System SHALL 카드 리스트에 무한 스크롤 또는 "더 보기" 버튼 패턴을 적용한다
5. WHEN 검색 결과가 없을 때, THE Design_System SHALL 빈 상태에 관련 추천 키워드를 칩 형태로 제안한다

---

### 요구사항 13: 페이지 전환 및 네비게이션 디자인

**사용자 스토리:** 사용자로서, 페이지 간 이동이 자연스럽고 현재 위치를 항상 파악하고 싶다. 그래야 앱 내에서 길을 잃지 않는다.

#### 인수 조건

1. THE Page_Transition SHALL 페이지 이동 시 콘텐츠 영역에 페이드 또는 슬라이드 전환 효과를 적용한다
2. THE Design_System SHALL 하단 네비게이션 바를 추가하여 홈, 딴길 찾기, 나의 서랍, 커뮤니티 간 빠른 이동을 제공한다
3. THE Design_System SHALL 하단 네비게이션 바의 현재 활성 탭을 아이콘 색상 변경과 라벨 표시로 구분한다
4. WHEN 사용자가 뒤로가기를 탭하면, THE Page_Transition SHALL 우측에서 좌측으로의 슬라이드 아웃 효과를 적용한다
5. THE Design_System SHALL 페이지 헤더의 뒤로가기 버튼을 화살표 아이콘(SVG)으로 교체하고 터치 타겟을 44px × 44px 이상으로 설정한다
