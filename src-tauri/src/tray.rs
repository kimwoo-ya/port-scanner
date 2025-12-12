use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    App, Manager,
};
use tauri_plugin_positioner::{WindowExt, Position};

pub fn setup_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let icon = app.default_window_icon()
        .cloned()
        .ok_or("Failed to load icon")?;

    TrayIconBuilder::new()
        .icon(icon)
        .on_tray_icon_event(|tray, event| {
            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
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
}
