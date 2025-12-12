# Tauri Tray App - Backend Documentation

This document describes the structure and functionality of the Rust backend for the Tauri Tray App.

## Overview
The backend is built using **Tauri** and **Rust**. It handles system-level operations such as:
- Tray icon management and positioning.
- Retrieving active TCP listening ports.
- Killing processes by PID.

## Key Files

### `src-tauri/src/lib.rs`
This is the main library file where the application logic resides.

#### Functions

- **`run()`**
  - **Purpose**: Initializes and runs the Tauri application.
  - **Details**:
    - Sets up plugins (`opener`, `positioner`, `store`).
    - Configures the **System Tray**:
      - `on_tray_icon_event`: Handles tray events.
      - Updates the tray position using `tauri_plugin_positioner`.
      - Toggles window visibility on left-click.

- **`get_ports()`** (Command)
  - **Purpose**: helper to get active TCP listening ports.
  - **Returns**: A JSON list of port info (local port, PID, process name, state).
  - **Logic**:
    - Uses `netstat2` to get socket info.
    - Filters for `TCP` protocol and `LISTEN` state.

- **`kill_by_pid(pid: u32)`** (Command)
  - **Purpose**: Kill a specific process.
  - **Platform Specifics**:
    - **macOS/Linux**: Uses `kill -9 <pid>`.
    - **Windows**: Uses `taskkill /PID <pid> /F`.

- **`get_process_name(pid: u32)`**
  - **Purpose**: Resolves a PID to its process name.

## Dependencies
- **tauri**: Core framework.
- **tauri-plugin-positioner**: Helper for positioning windows relative to the tray.
- **netstat2**: Network socket information.
- **sysinfo**: System and process information.
- **serde_json**: JSON serialization.
