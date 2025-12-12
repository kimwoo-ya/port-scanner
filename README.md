# Tauri Tray App (System Port Manager)

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="Port Scanner Logo" width="256" height="256" />
</p>

[![English](https://img.shields.io/badge/lang-English-blue.svg)](README_EN.md)

**Tauri v2**, **Rust**, **React** 기반의 미니멀한 시스템 트레이 애플리케이션으로, 시스템에서 활성화된 TCP 리스닝 포트를 모니터링하고 관리할 수 있습니다.

![Port Scanner Screenshot](docs/screenshot.png)

## ✨ 주요 기능

- **포트 모니터링**: TCP 포트에서 리스닝 중인 프로세스 목록을 실시간으로 확인합니다.
- **프로세스 관리**: 목록에서 프로세스를 직접 종료할 수 있습니다.
- **필터링**: 특정 프로세스 이름을 목록에서 "숨김" 처리할 수 있습니다. (로컬 저장소에 유지됨)
- **자동 새로고침**: 1.5초마다 목록을 자동으로 업데이트합니다.
- **시스템 트레이 통합**:
  - 백그라운드에서 조용히 실행됩니다.
  - 트레이 아이콘을 왼쪽 클릭하여 관리 패널을 열고 닫을 수 있습니다.
  - 우클릭 컨텍스트 메뉴를 통해 빠르게 종료할 수 있습니다.
- **크로스 플랫폼**: macOS, Windows, Linux 환경을 지원하도록 설계되었습니다.

## 🛠️ 기술 스택

- **Backend**: Rust
  - [`sysinfo`](https://crates.io/crates/sysinfo): 강력한 프로세스 관리 및 크로스 플랫폼 종료 명령어 지원.
  - [`netstat2`](https://crates.io/crates/netstat2): 네트워크 소켓 정보 검색.
  - `tauri-plugin-positioner`: 트레이 아이콘 기준 윈도우 위치 조정.
  - `tauri-plugin-store`: 설정 데이터의 영구 저장.
- **Frontend**: React + TypeScript
  - **Vite**: 빠른 빌드 도구.
  - **CSS**: 외부 UI 프레임워크 의존성 없는 커스텀 미니멀 디자인.

## 🚀 시작하기

### 필수 요구 사항

- **Rust**: [Rust 설치](https://www.rust-lang.org/tools/install)
- **Node.js**: [Node.js 설치](https://nodejs.org/) (LTS 권장)
- **pnpm**: `npm install -g pnpm`

### 설치 방법

1. 저장소 클론:
   ```bash
   git clone <repository-url>
   cd port-scanner
   ```

2. 프론트엔드 의존성 설치:
   ```bash
   pnpm install
   ```

3. 개발 모드로 실행:
   ```bash
   pnpm tauri dev
   ```

### 프로덕션 빌드

운영체제에 맞는 릴리스 빌드 생성:

```bash
pnpm tauri build
```
실행 파일은 `src-tauri/target/release/bundle/` 경로에 생성됩니다.

## 🖥️ 지원 환경

이 애플리케이션은 다음 환경에서 동작이 확인되었습니다:

- **macOS**: 완벽 지원.
- **Windows**: 완벽 지원.
- **Linux (Ubuntu/GNOME)**: 지원함.
  - *참고*: 트레이 아이콘 동작은 데스크탑 환경(DE)에 따라 다를 수 있습니다. `libwebkit2gtk` 및 앱 인디케이터 지원이 필요할 수 있습니다.

## 📂 프로젝트 구조

- `src-tauri/src/lib.rs`: 메인 백엔드 로직 (트레이 설정, 포트 스캔, 프로세스 종료).
- `src/components/SystemPortPanel.tsx`: 포트 목록을 보여주는 메인 UI 컴포넌트.
- `src/hooks/useSystemPort.ts`: 상태 관리 및 데이터 페칭 로직.

## 📄 문서

더 자세한 정보는 `docs/` 디렉토리를 확인하세요:

- [백엔드 문서 (Backend Logic)](docs/ko/backend.md)
- [프론트엔드 문서 (Frontend)](docs/ko/frontend.md)
- [크로스 플랫폼 검증 (Cross-Platform Verification)](docs/ko/cross_platform_verification.md)

---
[English Documentation](README_EN.md)
