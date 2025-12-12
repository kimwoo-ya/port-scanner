import { useEffect } from 'react';
import { useSystemPort } from '../hooks/useSystemPort';
import '../styles/SystemPortPanel.css';
import useProcessKill from '../hooks/useProcessKill';

/**
 * Component to display system ports and control processes.
 *
 * [IMPROVEMENT:5] The sorting logic inside the render method (Object.entries...sort) could be expensive if the list is large.
 * Consider attempting to move this sorting logic into the `useSystemPort` hook or memoizing the result with `useMemo` to avoid re-sorting on every render.
 */
const SystemPortPanel = () => {
  const { portDict, loading, refetch, addSkipProcess, resetStore, portCount } = useSystemPort();
  const { killAndRefresh } = useProcessKill(refetch);
  useEffect(() => {
    //console.log('>>>>' + JSON.stringify(portDict));
    console.log('Object.entries(portDict).length:' + Object.entries(portDict).length);
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
        <table className="port-table">
          <thead>
            <tr>
              <th>Local Port</th>
              <th>PID</th>
              <th>State</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {portDict && Object.entries(portDict).length > 0 ? (
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
                      .map((portInfo, i) => (
                        <tr key={`${processName}-${portInfo.local_port}-${i}`} className="port-row">
                          <td>{portInfo.local_port}</td>
                          <td>{portInfo.pid}</td>
                          <td>{portInfo.state}</td>
                          <td>
                            <button className="btn-sm" onClick={() => killAndRefresh(portInfo.pid)}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                  </>
                ))
            ) : (
              <>
                <tr>
                  <td colSpan={4}>
                    <h3>nothing...</h3>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SystemPortPanel;
