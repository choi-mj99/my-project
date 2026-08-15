# 밸런스 게임 웹앱 디자인 브레인스토밍

## Approach 1
- **Theme Name**: Zero-Sum
- **Very Brief Intro**: 어두운 남색 공간 위에 전기적인 시안·핑크 포인트를 얹어, 밤에 몰래 즐기는 아케이드 게임의 긴장감과 유쾌함을 표현한다.
- **Probability**: 0.07

## Approach 2
- **Theme Name**: Paper Panic
- **Very Brief Intro**: 크림색 종이 질감, 검은 잉크, 형광 형광펜을 조합해 친구가 낙서한 밸런스 게임 노트 같은 친근한 분위기를 만든다.
- **Probability**: 0.03

## Approach 3
- **Theme Name**: Cosmic Tribunal
- **Very Brief Intro**: 별빛, 심판대, 거대한 선택 카드를 사용해 사소한 딜레마를 우주적 사건처럼 과장한다. 장난스러운 장엄함이 핵심이다.
- **Probability**: 0.09

## Chosen Direction: Neon Arcade

- **Design Movement**: 1980년대 아케이드 그래픽과 contemporary digital brutalism을 결합한 네온 인터페이스.
- **Core Principles**: 강한 선택 대비, 카드 중심의 즉시성, 짧고 탄력적인 모션, 어두운 공간 속 제한된 형광색.
- **Color Philosophy**: 깊은 남색은 밤에 몰래 게임하는 집중 상태를 만들고, 시안은 A의 차가운 논리, 핑크는 B의 위험한 유혹, 노랑은 VS와 판단의 순간을 상징한다.
- **Layout Paradigm**: 중앙 스마트폰 프레임을 기준으로 정보가 위에서 아래로 ‘스캔’되며, 선택 카드는 수직 스택으로 충돌한다. 결과 화면은 통계 막대와 성향 배지를 중심으로 구성한다.
- **Signature Elements**: 전기 번개 로고, 홀로그램 테두리, 선택 카드 사이의 발광 VS 코어.
- **Interaction Philosophy**: 누르는 즉시 선택이 확정되고 다음 질문으로 넘어가며, 진동·사운드·짧은 스케일 변화가 입력을 즉각 확인한다.
- **Animation**: 화면 전환은 220~320ms의 탄력적인 상승, 선택 카드는 140ms press scale, 결과 통계 막대는 700ms ease-out으로 채운다. reduced-motion 환경에서는 모든 장식을 정적으로 유지한다.
- **Typography System**: 제목은 Space Grotesk ExtraBold, 본문은 Pretendard 또는 system sans. 제목은 강한 자간 압축과 짧은 행 길이, 본문은 1.6행간으로 가독성을 확보한다.
- **Brand Essence**: 평범한 선택을 거부하고 친구들과 멘탈을 겨루는 야간형 밸런스 게임. Personality: 과장된, 장난스러운, 즉각적인.
- **Brand Voice**: 헤드라인은 짧고 도발적이며, CTA는 명령형이 아닌 게임 초대처럼 말한다. 예시: “둘 다 싫지? 그래도 하나 골라.” / “다음 지옥으로 이동.”
- **Wordmark & Logo**: 텍스트 대신 번개가 두 선택지를 가르는 형태의 심볼을 사용하고, 헤더에서는 작은 전기 코어처럼 빛나게 한다.
- **Signature Brand Color**: electric cyan `#63F5FF`.

## Style Decisions

- 전체 앱은 기존 단일 HTML의 4개 모드, 통계·성향 분석, 테마 전환, 진동, 배경음 흐름을 유지한다.
- 기본 테마는 다크 네온이며, 화이트 테마는 동일한 정보 구조를 밝은 종이빛으로 반전한다.
- 배경음은 외부 파일을 강제하지 않고 사용자 제스처 이후 재생되도록 구성한다.

## Style Decisions

스타일 리뷰를 반영해 전체 시스템에 CRT 스캔라인과 홀로그램 외곽선을 추가했다. electric cyan은 브랜드와 시스템 상태의 주색으로 강화하고, 핑크는 B 선택의 유혹, 노랑은 VS와 판정의 심판색으로 역할을 고정했다. 제목은 더 단단한 아케이드 간판처럼 처리하고, 모드 카드는 단순 메뉴가 아니라 상단 전기 라인이 있는 충돌 패널로 표현한다. 주요 카피는 설명보다 짧은 게임 초대의 리듬을 우선한다.
