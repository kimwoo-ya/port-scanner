# Tauri Tray App - 백엔드 문서

이 문서는 Tauri Tray App의 Rust 백엔드 구조와 기능에 대해 설명합니다.

## 개요 (Overview)
백엔드는 **Tauri**와 **Rust**를 사용하여 구축되었습니다. 다음과 같은 시스템 수준의 작업을 처리합니다:
- 트레이 아이콘 관리 및 위치 지정.
- 활성화된 TCP 리스닝 포트 검색.
- PID를 이용한 프로세스 종료.

## 주요 파일 (Key Files)

### `src-tauri/src/lib.rs`
애플리케이션 로직이 존재하는 메인 라이브러리 파일입니다.

#### 함수 (Functions)

- **`run()`**
  - **목적**: Tauri 애플리케이션을 초기화하고 실행합니다.
  - **상세**:
    - 플러그인 설정 (`opener`, `positioner`, `store`).
    - **시스템 트레이** 설정:
      - `on_tray_icon_event`: 트레이 이벤트 처리.
      - `tauri_plugin_positioner`를 사용하여 트레이 위치 업데이트.
      - 왼쪽 클릭 시 윈도우 표시/숨김 토글.
  - **개선 사항 (점수: 7)**: `run` 내부의 설정 로직이 다소 복집합니다. 트레이 설정 로직을 별도의 헬퍼 함수로 분리하면 가독성이 향상될 것입니다.

- **`get_ports()`** (Command)
  - **목적**: 활성화된 TCP 리스닝 포트를 가져오는 헬퍼입니다.
  - **반환값**: 포트 정보 목록 JSON (로컬 포트, PID, 프로세스 이름, 상태).
  - **로직**:
    - `netstat2`를 사용하여 소켓 정보를 가져옵니다.
    - `TCP` 프로토콜 및 `LISTEN` 상태인 항목만 필터링합니다.

- **`kill_by_pid(pid: u32)`** (Command)
  - **목적**: 특정 프로세스를 종료합니다.
  - **플랫폼 특이사항**:
    - **macOS/Linux**: `kill -9 <pid>` 명령어 사용.
    - **Windows**: `taskkill /PID <pid> /F` 명령어 사용.
  - **개선 사항 (점수: 6)**: 현재 원시 쉘 명령어를 사용하고 있습니다. `sysinfo`와 같은 라이브러리를 사용하여 프로세스를 종료하면 더 안정적이고 크로스 플랫폼 친화적일 것입니다.

- **`get_process_name(pid: u32)`**
  - **목적**: PID를 프로세스 이름으로 변환합니다.
  - **개선 사항 (점수: 7)**: 이 함수는 *호출될 때마다* `System::new_all()`을 인스턴스화합니다. 이는 비효율적입니다. 공유 `System` 상태를 사용하거나 일괄 처리(batch processing)를 하면 성능이 크게 향상될 것입니다.

## 의존성 (Dependencies)
- **tauri**: 핵심 프레임워크.
- **tauri-plugin-positioner**: 트레이 아이콘 기준 윈도우 위치 지정을 위한 헬퍼.
- **netstat2**: 네트워크 소켓 정보.
- **sysinfo**: 시스템 및 프로세스 정보.
- **serde_json**: JSON 직렬화.
