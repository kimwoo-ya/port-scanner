////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
//#[tauri::command]
//fn greet(name: &str) -> String {
//    format!("Hello, {}! You've been greeted from Rust!", name)
//}

//#[cfg_attr(mobile, tauri::mobile_entry_point)]
//pub fn run() {
//    tauri::Builder::default()
//.plugin(tauri_plugin_shell::init())
//        .plugin(tauri_plugin_opener::init())
//        .invoke_handler(tauri::generate_handler![greet])
//        .run(tauri::generate_context!())
//        .expect("error while running tauri application");
//}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//use tauri::Manager;

//#[cfg_attr(mobile, tauri::mobile_entry_point)]
//pub fn run() {
//    tauri::Builder::default()
//        .plugin(tauri_plugin_shell::init())
//        .invoke_handler(tauri::generate_handler![quit_app])
//        .run(tauri::generate_context!())
//        .expect("error while running tauri application");
//}

//#[tauri::command]
//fn quit_app(app: tauri::AppHandle) {
//    app.exit(0);
//}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//use tauri::command;
//use netstat2::{
//    get_sockets_info,
//    AddressFamilyFlags,
//    ProtocolFlags,
//    ProtocolSocketInfo,
//};
//use serde_json::json;

//#[command]
//fn get_ports() -> Vec<serde_json::Value> {
//    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
//    let proto_flags = ProtocolFlags::TCP | ProtocolFlags::UDP;

//    let sockets = get_sockets_info(af_flags, proto_flags).unwrap();

//    sockets
//        .into_iter()
//        .map(|s| {
//            let (local_port, remote_port, state) = match s.protocol_socket_info {
//                ProtocolSocketInfo::Tcp(tcp) => (
//                    tcp.local_port,
//                    tcp.remote_port,
//                    format!("{:?}", tcp.state),
//                ),
//                ProtocolSocketInfo::Udp(udp) => (
//                    udp.local_port,
//                    udp.remote_port,
//                    "UDP".to_string(),
//                ),
//            };

//            json!({
//                "local_port": local_port,
//                "remote_port": remote_port,
//                "pid": s.associated_pids.get(0).cloned().unwrap_or(0),
//                "state": state
//            })
//        })
//        .collect()
//}

//pub fn run() {
//    tauri::Builder::default()
//        .invoke_handler(tauri::generate_handler![
//            get_ports
//        ])
//        .run(tauri::generate_context!())
//        .expect("error while running tauri application");
//}

use tauri::{command, Manager};
use netstat2::{
    get_sockets_info,
    AddressFamilyFlags,
    ProtocolFlags,
    ProtocolSocketInfo,
};
use serde_json::json;
use sysinfo::{System, Pid, Process};

fn get_process_name(pid: u32) -> String {
    let mut sys = System::new_all();
    sys.refresh_all();

    // ✅ Pid::from_u32()는 직접 Pid 반환
    let pid_sys = Pid::from_u32(pid);
    sys.process(pid_sys)
        .map(|p| p.name().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 사용중인 플러그인
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())

        // 모든 command 등록
        .invoke_handler(tauri::generate_handler![
            quit_app,
            get_ports,
        ])

        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
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

//#[command]
//fn get_ports() -> Vec<serde_json::Value> {
//    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
//    let proto_flags = ProtocolFlags::TCP | ProtocolFlags::UDP;

//    let sockets = get_sockets_info(af_flags, proto_flags).unwrap();

//    sockets
//        .into_iter()
//        .map(|s| {
//            match s.protocol_socket_info {
//                ProtocolSocketInfo::Tcp(tcp) => json!({
//                    "local_port": tcp.local_port,
//                    "remote_port": tcp.remote_port,
//                    "pid": s.associated_pids.get(0).cloned().unwrap_or(0),
//                    "state": format!("{:?}", tcp.state)
//                }),

//                ProtocolSocketInfo::Udp(udp) => json!({
//                    "local_port": udp.local_port,
//                    // UDP에는 remote_port가 없음 → null 또는 0 처리
//                    "remote_port": null,
//                    "pid": s.associated_pids.get(0).cloned().unwrap_or(0),
//                    "state": "UDP"
//                }),
//            }
//        })
//        .collect()
//}