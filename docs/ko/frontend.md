# Tauri Tray App - 프론트엔드 문서

이 문서는 Tauri Tray App의 React 프론트엔드 구조와 기능에 대해 설명합니다.

## 개요 (Overview)
프론트엔드는 **TypeScript**로 작성된 **React** 애플리케이션(Vite 기반)입니다. 시스템 포트를 조회하고 관리하기 위한 UI를 제공합니다.

## 주요 컴포넌트 (Key Components)

### `src/components/SystemPortPanel.tsx`
트레이 윈도우에 표시되는 메인 패널 컴포넌트입니다.

- **기능**:
  - 활성 프로세스와 포트 목록을 테이블 형태로 표시합니다.
  - 프로세스를 "Skip"(숨김) 처리할 수 있습니다.
  - 프로세스를 종료(Kill)할 수 있습니다.
  - "Refresh"(새로고침) 및 "Reset Store"(설정 초기화) 버튼 제공.

## 훅 (Hooks)

### `src/hooks/useSystemPort.ts`
애플리케이션 상태 및 데이터 페칭 로직을 관리합니다.

- **상태 (State)**:
  - `ports`: 원시 포트 목록 데이터.
  - `portDict`: 프로세스 이름별로 그룹화된 포트 데이터.
  - `hiddenProcesses`: 무시할 프로세스 이름 목록 (저장소에 영구 보관).
- **기능**:
  - **폴링 (Polling)**: 5초마다 포트 정보를 갱신합니다.
  - **저장소 통합 (Store Integration)**: `.settings.dat` 파일에서 `skipProcessNameList`를 로드하고 저장합니다.
  - **중복 제거 (Deduplication)**: 중복된 포트 항목을 제거합니다.

### `src/hooks/useProcessKill.ts`
프로세스 종료 로직을 캡슐화합니다.

- **기능**:
  - `kill_by_pid` Tauri 명령어를 호출합니다.
  - 성공 시 포트 목록을 다시 가져옵니다.
  - 종료 작업에 대한 로딩 및 에러 상태를 관리합니다.

## 스타일 (Style)
- **`src/App.css`** & **`src/styles/SystemPortPanel.css`**: 패널 및 테이블 레이아웃을 위한 기본 CSS 스타일.
