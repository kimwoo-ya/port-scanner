// src/App.tsx
import { useSystemTray } from './hooks/useSystemTray';
import { TrayStatusPanel } from './components/TrayStatusPanel';
//import { useEffect, useState } from 'react';
import SystemPortPanel from './components/SystemPortPanel';

function App() {
  const { trayStatus, windowVisible } = useSystemTray();

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <TrayStatusPanel trayStatus={trayStatus} windowVisible={windowVisible} />
      <br />

      <div
        style={{
          background: '#f1f5f9',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <SystemPortPanel />
      </div>
      {/*<h1 style={{ color: '#2563eb' }}>🎯 Tauri 시스템 트레이 테스트</h1>*/}
    </div>
  );
}

export default App;
