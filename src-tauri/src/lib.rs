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

            // 트레이 아이콘
            TrayIconBuilder::new()
                .icon(icon)
                .on_tray_icon_event(|tray, event| {

                    // 1) Positioner에게 이벤트 전달 → 트레이 위치 저장됨
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    // 2) 좌클릭 시 창 표시/숨김 토글 및 위치 이동
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {

                        if let Some(window) = tray.app_handle().get_webview_window("main") {

                            // 🔥 멀티모니터에서 현재 클릭한 트레이 디스플레이 기준으로 이동
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

#[command]
fn get_ports() -> Vec<serde_json::Value> {
    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
    let proto_flags = ProtocolFlags::TCP;  // UDP 제거

    let sockets = get_sockets_info(af_flags, proto_flags).unwrap();

    sockets
        .into_iter()
        .filter_map(|s| {  // LISTEN만 필터링
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

fn get_process_name(pid: u32) -> String {
    let mut sys = System::new_all();
    sys.refresh_all();

    let pid_sys = Pid::from_u32(pid);
    sys.process(pid_sys)
        .map(|p| p.name().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}
