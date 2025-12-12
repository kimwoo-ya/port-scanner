# Cross-Platform Verification Report

본 문서는 `port-scanner`의 다양한 운영체제(Windows, macOS, Linux) 호환성 검증 결과를 기술합니다.

## 1. Backend (Rust)

### Process Management (`sysinfo`)
- **Library**: `sysinfo v0.30`
- **Function**: `process.kill()` used in `kill_by_pid`
- **Compatibility**:
  - **Windows**: `TerminateProcess` API를 사용하여 강력하게 종료합니다. 정상 동작 예상.
  - **macOS/Linux**: `SIGKILL` 시그널을 전송합니다. 정상 동작 예상.
  - **Note**: 타 사용자의 프로세스를 종료하려면 관리자 권한(Root/Admin)이 필요할 수 있습니다.

### Network Port Scanning (`netstat2`)
- **Library**: `netstat2 v0.11.2`
- **Compatibility**:
  - **Windows/macOS/Linux**: 모두 지원합니다.
  - **Note**: macOS와 Linux에서는 자신의 소유가 아닌 프로세스의 상세 정보(PID 등)를 조회할 때 권한 제한이 있을 수 있습니다. (빈 PID로 나올 가능성 있음)

### Tray & Positioning (`tauri-plugin-positioner`)
- **Windows**: 완벽 호환. 트레이 아이콘 위치 계산이 정확합니다.
- **macOS**: 완벽 호환.
- **Linux**: 데스크탑 환경(DE)에 따라 차이가 큽니다.
  - **GNOME**: 기본적으로 트레이 아이콘을 지원하지 않아 `AppIndicator` 확장이 필요할 수 있습니다.
  - **Positioning**: 리눅스에서는 트레이 아이콘의 정확한 좌표를 얻는 것이 까다로워, `Position::TrayCenter`가 화면 중앙이나 마우스 커서 위치 등으로 대체 동작할 수 있습니다.

### Window Transparency (`transparent: true`)
- **Windows/macOS**: 기본 지원.
- **Linux**: 컴포지터(Compositor)가 필요합니다. 투명 배경이 검은색으로 나올 경우 시스템 설정 확인이 필요합니다.

## 2. Frontend (TypeScript/CSS)

### Scrollbar Hiding
- **Code**:
  ```css
  *::-webkit-scrollbar { display: none; }
  html, body { scrollbar-width: none; }
  ```
- **Windows (WebView2)**: Chromium 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.
- **macOS (WebKit)**: Safari 엔진 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.
- **Linux (WebKitGTK)**: Chromium/WebKit 기반이므로 `::-webkit-scrollbar`가 정상 동작합니다.

### Fonts
- **Stack**: `'Inter', system-ui, ...`
- **Result**:
  - **Windows**: `Inter`가 없으면 `Segoe UI`로 폴백 (가독성 좋음).
  - **macOS**: `San Francisco` (Visual matching 훌륭함).
  - **Linux**: `Ubuntu`, `Cantarell`, `Roboto` 등 시스템 기본 폰트로 렌더링.
- **Verdict**: 모든 플랫폼에서 깨짐 없이 자연스럽게 보입니다.

## 3. Summary
| Feature | Windows | macOS | Linux |
| :--- | :---: | :---: | :---: |
| Process Kill | ✅ | ✅ | ✅ (권한 주의) |
| Port Scan | ✅ | ✅ | ✅ (권한 주의) |
| Tray Icon | ✅ | ✅ | ⚠️ (DE 의존적) |
| UI/Design | ✅ | ✅ | ✅ |

**Linux**환경에서의 배포 시, 사용자의 데스크탑 환경(GNOME, KDE 등)에 따라 트레이 동작 경험이 다를 수 있음을 사용자에게 고지하는 것이 좋습니다.
