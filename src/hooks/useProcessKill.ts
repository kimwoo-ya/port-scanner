// src/hooks/useProcessKill.ts
import { invoke } from '@tauri-apps/api/core';
import { useCallback, useState } from 'react';

export const useProcessKill = (refetch: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const killAndRefresh = async (pid: number) => {
    await killProcessByPid(pid);
    refetch();
  };
  const killProcessByPid = useCallback(async (pid: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await invoke('kill_by_pid', { pid });
      setSuccess(true);
    } catch (e: any) {
      console.error('[kill_by_pid error]', e);
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    killAndRefresh,
    loading,
    error,
    success
  };
};

export default useProcessKill;
