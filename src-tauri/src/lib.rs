mod tray;

use std::sync::Mutex;
use tauri::{
    command, Manager, State,
};
use netstat2::{
    get_sockets_info,
    AddressFamilyFlags,
    ProtocolFlags,
    ProtocolSocketInfo,
};
use serde_json::json;
use sysinfo::{System, Pid};

// Define AppState to hold the persistent System instance
struct AppState {
    system: Mutex<System>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Initialize AppState with System
            let mut sys = System::new_all();
            sys.refresh_all();
            app.manage(AppState {
                system: Mutex::new(sys),
            });

            tray::setup_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_ports, kill_by_pid])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Kills a process by its PID using `sysinfo`.
/// Uses shared AppState to avoid re-initializing System.
#[tauri::command]
fn kill_by_pid(state: State<'_, AppState>, pid: u32) -> Result<(), String> {
    let mut sys = state.system.lock().map_err(|_| "Failed to lock system state".to_string())?;

    // Refresh only processes to ensure we have the latest state
    sys.refresh_processes();

    let pid_sys = Pid::from_u32(pid);
    if let Some(process) = sys.process(pid_sys) {
        if process.kill() {
            Ok(())
        } else {
            Err("Failed to kill process (possibly permission denied)".to_string())
        }
    } else {
        Err("Process not found".to_string())
    }
}

/// Retrieves a list of active TCP listening ports and their associated PIDs.
/// Uses shared AppState for efficient process name lookup.
#[command]
fn get_ports(state: State<'_, AppState>) -> Vec<serde_json::Value> {
    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
    let proto_flags = ProtocolFlags::TCP;

    // Lock and refresh system state
    let mut sys = state.system.lock().unwrap(); // Unwrap safe here as poisoning is rare/recoverable by restart
    sys.refresh_processes();

    let sockets = get_sockets_info(af_flags, proto_flags).unwrap_or_default();

    sockets
        .into_iter()
        .filter_map(|s| {
            if let ProtocolSocketInfo::Tcp(tcp) = s.protocol_socket_info {
                if tcp.state == netstat2::TcpState::Listen {
                    let pid = s.associated_pids.get(0).cloned().unwrap_or(0);
                    Some(json!({
                        "local_port": tcp.local_port,
                        "pid": pid,
                        "process_name": get_process_name(&sys, pid),
                        "state": format!("{:?}", tcp.state),
                        "show_yn": true
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
fn get_process_name(sys: &System, pid: u32) -> String {
    let pid_sys = Pid::from_u32(pid);
    sys.process(pid_sys)
        .map(|p| p.name().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}
