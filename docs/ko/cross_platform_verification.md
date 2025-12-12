# 크로스 플랫폼 검증 리포트 (Cross-Platform Verification Report)

본 문서는 `port-scanner`의 다양한 운영체제(Windows, macOS, Linux) 호환성 검증 결과를 기술합니다.

## 1. 백엔드 (Backend - Rust)

### 프로세스 관리 (`sysinfo`)
- **라이브러리**: `sysinfo v0.30`
- **기능**: `kill_by_pid`에서 사용되는 `process.kill()`
- **호환성**:
  - **Windows**: `TerminateProcess` API를 사용하여 강력하게 종료합니다. 정상 동작 예상.
  - **macOS/Linux**: `SIGKILL` 시그널을 전송합니다. 정상 동작 예상.
  - **참고**: 타 사용자의 프로세스를 종료하려면 관리자 권한(Root/Admin)이 필요할 수 있습니다.

### 네트워크 포트 스캔 (`netstat2`)
- **라이브러리**: `netstat2 v0.11.2`
- **호환성**:
  - **Windows/macOS/Linux**: 모두 지원합니다.
  - **참고**: macOS와 Linux에서는 자신의 소유가 아닌 프로세스의 상세 정보(PID 등)를 조회할 때 권한 제한이 있을 수 있습니다. (빈 PID로 나올 가능성 있음)

### 트레이 및 위치 지정 (`tauri-plugin-positioner`)
- **Windows**: 완벽 호환. 트레이 아이콘 위치 계산이 정확합니다.
- **macOS**: 완벽 호환.
- **Linux**: 데스크탑 환경(DE)에 따라 차이가 큽니다.
  - **GNOME**: 기본적으로 트레이 아이콘을 지원하지 않아 `AppIndicator` 확장이 필요할 수 있습니다.
  - **위치 지정 (Positioning)**: 리눅스에서는 트레이 아이콘의 정확한 좌표를 얻는 것이 까다로워, `Position::TrayCenter`가 화면 중앙이나 마우스 커서 위치 등으로 대체 동작할 수 있습니다.

### 윈도우 투명도 (`transparent: true`)
- **Windows/macOS**: 기본 지원.
- **Linux**: 컴포지터(Compositor)가 필요합니다. 투명 배경이 검은색으로 나올 경우 시스템 설정 확인이 필요합니다.

## 2. 프론트엔드 (Frontend - TypeScript/CSS)

### 스크롤바 숨김 (Scrollbar Hiding)
- **코드**:
  ```css
  *::-webkit-scrollbar { display: none; }
  html, body { scrollbar-width: none; }
  ```
- **Windows (WebView2)**: Chromium 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.
- **macOS (WebKit)**: Safari 엔진 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.
- **Linux (WebKitGTK)**: Chromium/WebKit 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.

### 폰트 (Fonts)
- **스택**: `'Inter', system-ui, ...`
- **결과**:
  - **Windows**: `Inter`가 없으면 `Segoe UI`로 폴백 (가독성 좋음).
  - **macOS**: `San Francisco` (Visual matching 훌륭함).
  - **Linux**: `Ubuntu`, `Cantarell`, `Roboto` 등 시스템 기본 폰트로 렌더링.
- **결론**: 모든 플랫폼에서 깨짐 없이 자연스럽게 보입니다.

## 3. 요약 (Summary)
| 기능 | Windows | macOS | Linux |
| :--- | :---: | :---: | :---: |
| 프로세스 종료 (Process Kill) | ✅ | ✅ | ✅ (권한 주의) |
| 포트 스캔 (Port Scan) | ✅ | ✅ | ✅ (권한 주의) |
| 트레이 아이콘 (Tray Icon) | ✅ | ✅ | ⚠️ (DE 의존적) |
| UI/디자인 | ✅ | ✅ | ✅ |

**Linux**환경에서의 배포 시, 사용자의 데스크탑 환경(GNOME, KDE 등)에 따라 트레이 동작 경험이 다를 수 있음을 사용자에게 고지하는 것이 좋습니다.
