// src/hooks/useSystemTray.ts
import { useEffect, useRef, useState } from 'react';
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';

let isTrayInitialized = false;

export function useSystemTray() {
  const [trayStatus, setTrayStatus] = useState('초기화 중...');
  const [windowVisible, setWindowVisible] = useState(true);
  const trayRef = useRef<TrayIcon | null>(null);
  const currentWindowRef = useRef(getCurrentWindow());

  useEffect(() => {
    if (isTrayInitialized) {
      console.log('트레이가 이미 전역에서 초기화됨, 스킵');
      setTrayStatus('트레이 아이콘 이미 생성됨 ✓');
      return;
    }

    isTrayInitialized = true;
    setupSystemTray();

    // 트레이는 앱 전체 라이프사이클 동안 유지하고 싶다면 cleanup 없음
    // 필요하면 여기서 trayRef.current?.remove() 등 처리
  }, []);

  async function setupSystemTray() {
    try {
      const currentWindow = currentWindowRef.current;

      const menu = await Menu.new({
        items: [
          {
            id: 'show',
            text: '표시',
            action: async () => {
              console.log('표시 클릭됨');
              await currentWindow.show();
              await currentWindow.unminimize();
              await currentWindow.setFocus();
              setWindowVisible(true);
              console.log('윈도우 표시 완료');
            }
          },
          {
            id: 'hide',
            text: '숨기기',
            action: async () => {
              console.log('숨기기 클릭됨');
              await currentWindow.hide();
              setWindowVisible(false);
              console.log('윈도우 숨김 완료');
            }
          },
          {
            id: 'quit',
            text: '종료',
            action: async () => {
              console.log('종료 메뉴 클릭됨');
              try {
                await invoke('quit_app');
              } catch (err) {
                console.error('종료 오류:', err);
                window.close();
              }
            }
          }
        ]
      });

      const tray = await TrayIcon.new({
        icon: (await defaultWindowIcon())!, // 앱 아이콘 재사용
        menu,
        menuOnLeftClick: true,
        tooltip: 'My Tauri App',
        action: async (event) => {
          switch (event.type) {
            case 'Click':
              console.log(`mouse ${event.button} button pressed, state: ${event.buttonState}`);
              break;
            case 'DoubleClick':
              console.log(`mouse ${event.button} button pressed`);
              break;
            case 'Enter':
              break;
            case 'Move':
              break;
            case 'Leave':
              break;
          }

          // 왼쪽 클릭 시 윈도우 표시/숨기기 토글
          //  if (event.type === 'Click' && event.button === 'Left') {
          //    const isVisible = await currentWindow.isVisible();
          //    console.log('isVisible:' + isVisible + ', event.type:' + event.type);

          //    if (isVisible) {
          //      await currentWindow.hide();
          //      setWindowVisible(false);
          //      console.log('윈도우 숨김');
          //    } else {
          //      await currentWindow.show();
          //      await currentWindow.unminimize();
          //      await currentWindow.setFocus();
          //      setWindowVisible(true);
          //      console.log('윈도우 표시');
          //    }
          //  }
        }
      });

      trayRef.current = tray;
      setTrayStatus('트레이 아이콘 생성 완료 ✓');
      console.log('시스템 트레이 설정 완료:', tray);
    } catch (error) {
      console.error('트레이 설정 오류:', error);
      setTrayStatus(`오류 발생: ${error}`);
    }
  }

  return {
    trayStatus,
    windowVisible
  };
}
