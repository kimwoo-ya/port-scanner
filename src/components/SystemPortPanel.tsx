import { useEffect } from 'react';
import { useSystemPort } from '../hooks/useSystemPort';
import '../styles/SystemPortPanel.css';

const SystemPortPanel = () => {
  const { portDict, loading, refetch, addSkipProcess, resetStore, portCount } = useSystemPort();
  useEffect(() => {
    //console.log('>>>>' + JSON.stringify(portDict));
  }, [portDict]);

  return (
    <>
      <div className="controls">
        <button onClick={refetch} disabled={loading} className="btn refresh-btn">
          {loading ? '조회중...' : `포트 새로고침 (${portCount})`}
        </button>
        <button className="btn reset-btn" onClick={resetStore}>
          스토리지 초기화
        </button>
      </div>

      <div className="panel">
        <h2>Opened Ports</h2>

        <table className="port-table">
          <thead>
            <tr>
              <th>Local Port</th>
              <th>PID</th>
              <th>State</th>
              <th>kill?</th>
            </tr>
          </thead>
          <tbody>
            {portDict &&
              Object.entries(portDict)
                .sort((o1, o2) => o1[0].localeCompare(o2[0]))
                .map(([processName, ports]) => (
                  <>
                    <tr className="proc-header">
                      <td colSpan={3}>{processName}</td>
                      <td>
                        <button className="btn-sm danger" onClick={() => addSkipProcess(processName)}>
                          🔕
                        </button>
                      </td>
                    </tr>
                    {ports
                      .sort((o1, o2) => o1.local_port - o2.local_port)
                      .map((port, i) => (
                        <tr key={`${processName}-${port.local_port}-${i}`} className="port-row">
                          <td>{port.local_port}</td>
                          <td>{port.pid}</td>
                          <td>{port.state}</td>
                          <td>
                            <button className="btn-sm">🗑️</button>
                          </td>
                        </tr>
                      ))}
                  </>
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SystemPortPanel;
