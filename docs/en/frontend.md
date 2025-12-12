# Tauri Tray App - Frontend Documentation

This document describes the structure and functionality of the React frontend for the Tauri Tray App.

## Overview
The frontend is a **React** application (Vite-powered) written in **TypeScript**. It provides the UI for viewing and managing system ports.

## Key Components

### `src/components/SystemPortPanel.tsx`
The main panel component displayed in the tray window.

- **Functionality**:
  - Displays a table of active processes and their ports.
  - Allows "skipping" (hiding) specific processes.
  - Allows killing processes.
  - "Refresh" and "Reset Store" buttons.

## Hooks

### `src/hooks/useSystemPort.ts`
Manages the application state and data fetching.

- **State**:
  - `ports`: raw list of ports.
  - `portDict`: ports grouped by process name.
  - `hiddenProcesses`: list of process names to ignore (persisted in store).
- **Functionality**:
  - **Polling**: Fetches ports every 5 seconds.
  - **Store Integration**: Loads and saves `skipProcessNameList` to `.settings.dat`.
  - **Deduplication**: Removes duplicate port entries.

### `src/hooks/useProcessKill.ts`
Encapsulates the logic for killing a process.

- **Functionality**:
  - Calls the Tauri command `kill_by_pid`.
  - Refetches the port list upon success.
  - Manages loading and error states for the kill action.

## Style
- **`src/App.css`** & **`src/styles/SystemPortPanel.css`**: Standard CSS for styling the panel and table layout.
