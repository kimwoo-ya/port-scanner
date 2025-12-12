// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_positioner::{WindowExt, Position};
use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    command, Manager,
};
use netstat2::{
    get_sockets_info,
    AddressFamilyFlags,
    ProtocolFlags,
    ProtocolSocketInfo,
};
use serde_json::json;
use sysinfo::{System, Pid, Process};

// [IMPROVEMENT:7] `run` function setup is good, but consider separating plugin initialization into a helper function for cleaner main logic.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let icon = app.default_window_icon()
                .cloned()
                .ok_or("Failed to load icon")?;

            // 트레이 아이콘 설정 (Tray Icon Setup)
            TrayIconBuilder::new()
                .icon(icon)
                .on_tray_icon_event(|tray, event| {

                    // 1) Positioner에게 이벤트 전달 → 트레이 위치 저장됨 (Pass event to Positioner -> Tray position saved)
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    // 2) 좌클릭 시 창 표시/숨김 토글 및 위치 이동 (Left click: Toggle Window show/hide & move position)
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {

                        if let Some(window) = tray.app_handle().get_webview_window("main") {

                            // 🔥 멀티모니터에서 현재 클릭한 트레이 디스플레이 기준으로 이동 (Move to tray's display on multi-monitor setup)
                            let _ = window.move_window(Position::TrayCenter);

                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_ports, kill_by_pid])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
/// Kills a process by its PID.
///
/// # Arguments
/// * `pid` - The Process ID to kill.
///
/// # Returns
/// * `Result<(), String>` - Returns Ok(()) if successful, or an error message if failed.
///
/// [IMPROVEMENT:6] This uses platform-specific `Command`. Consider using a crate like `sysinfo` (which is already imported)
/// to kill processes in a more cross-platform way if possible, or ensure robust error handling for edge cases (permission denied, etc.).
#[tauri::command]
fn kill_by_pid(pid: u32) -> Result<(), String> {
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        std::process::Command::new("kill")
            .arg("-9")
            .arg(pid.to_string())
            .status()
            .map_err(|e| format!("kill error: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("taskkill")
            .args(&["/PID", &pid.to_string(), "/F"])
            .status()
            .map_err(|e| format!("taskkill error: {}", e))?;
    }

    Ok(())
}

/// Retrieves a list of active TCP listening ports and their associated PIDs.
///
/// # Returns
/// * `Vec<serde_json::Value>` - A list of JSON objects containing local_port, pid, process_name, and state.
#[command]
fn get_ports() -> Vec<serde_json::Value> {
    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
    let proto_flags = ProtocolFlags::TCP;  // UDP removed

    let sockets = get_sockets_info(af_flags, proto_flags).unwrap_or_default(); // Unwrap handled safely with default

    sockets
        .into_iter()
        .filter_map(|s| {  // One filter to rule them all: Filter for LISTEN state
            if let ProtocolSocketInfo::Tcp(tcp) = s.protocol_socket_info {
                if tcp.state == netstat2::TcpState::Listen {
                    let pid = s.associated_pids.get(0).cloned().unwrap_or(0);
                    Some(json!({
                        "local_port": tcp.local_port,
                        "pid": pid,
                        "process_name": get_process_name(pid),
                        "state": format!("{:?}", tcp.state),
                        "show_yn": true
                        //"protocol": "TCP"
                    }))
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect()
}

/// Helper to get the process name from its PID using `sysinfo`.
///
/// [IMPROVEMENT:7] Instantiating `System::new_all()` and calling `refresh_all()` on every single call is very expensive.
/// Consider passing a reference to a `System` instance or using a `Mutex<System>` text to maintain state, or creating a new `System` only once per batch request.
fn get_process_name(pid: u32) -> String {
    let mut sys = System::new_all();
    sys.refresh_all();

    let pid_sys = Pid::from_u32(pid);
    sys.process(pid_sys)
        .map(|p| p.name().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}
