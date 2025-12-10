// src/components/TrayStatusPanel.tsx
type Props = {
  trayStatus: string;
  windowVisible: boolean;
};

export function TrayStatusPanel({ trayStatus, windowVisible }: Props) {
  return (
    <>
      <div
        style={{
          background: '#f1f5f9',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <h2 style={{ marginTop: 0 }}>📊 상태</h2>
        <p>
          <strong>트레이 상태:</strong> {trayStatus}
        </p>
        <p>
          <strong>윈도우 표시 여부:</strong> {windowVisible ? '✅ 표시됨' : '❌ 숨겨짐'}
        </p>
      </div>

      <div
        style={{
          background: '#e0f2fe',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <h2 style={{ marginTop: 0 }}>💡 사용법</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>트레이 아이콘 오른쪽 클릭:</strong> 메뉴 표시 (표시/숨기기/종료)
          </li>
          <li>
            <strong>트레이 아이콘 왼쪽 클릭:</strong> 메뉴 표시 (menuOnLeftClick=true)
          </li>
          <li>
            <strong>트레이 아이콘 더블 클릭:</strong> (필요 시 로직 추가)
          </li>
        </ul>
      </div>

      <div
        style={{
          background: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <h2 style={{ marginTop: 0 }}>⚙️ 메뉴 기능</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>표시:</strong> 윈도우를 화면에 표시하고 포커스
          </li>
          <li>
            <strong>숨기기:</strong> 윈도우를 숨김 (트레이에만 남음)
          </li>
          <li>
            <strong>종료:</strong> 애플리케이션 완전 종료
          </li>
        </ul>
      </div>

      <div
        style={{
          background: '#fee2e2',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <h2 style={{ marginTop: 0 }}>🔍 개발자 콘솔 확인</h2>
        <p>브라우저 개발자 도구 콘솔을 열어서 트레이 이벤트 로그를 확인하세요!</p>
      </div>
    </>
  );
}
