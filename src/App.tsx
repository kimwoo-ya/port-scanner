// src/App.tsx
import { useSystemTray } from './hooks/useSystemTray';
import { TrayStatusPanel } from './components/TrayStatusPanel';
//import { useEffect, useState } from 'react';
import SystemPortPanel from './components/SystemPortPanel';

function App() {
  //  const { trayStatus, windowVisible } = useSystemTray();

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <SystemPortPanel />
      {/*<h1 style={{ color: '#2563eb' }}>🎯 Tauri 시스템 트레이 테스트</h1>*/}
      {/*<TrayStatusPanel trayStatus={trayStatus} windowVisible={windowVisible} />*/}
    </div>
  );
}

export default App;
