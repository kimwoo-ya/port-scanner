// src/hooks/useSystemPort.ts
import { invoke } from '@tauri-apps/api/core';
import { Store } from '@tauri-apps/plugin-store';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage system ports, polling, and process filtering.
 *
 * @returns {object} An object containing port data, loading state, and control functions.
 */
export const useSystemPort = () => {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [portDict, setPortDict] = useState<PortInfoDict>({});
  const [loading, setLoading] = useState(false);

  const [hiddenProcesses, setHiddenProcesses] = useState<string[]>([]);
  const storeRef = useRef<Store | null>(null);
  const [storeLoaded, setStoreLoaded] = useState(false);



  // --- Store 로드 (한번만)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const store = await Store.load('.settings.dat');
        storeRef.current = store;
        if (!mounted) return;

        const saved = await store.get<string[]>('skipProcessNameList');
        if (Array.isArray(saved)) {
          setHiddenProcesses(saved);
        } else {
          // 초기값 저장해두기
          await store.set('skipProcessNameList', []);
          await store.save();
          setHiddenProcesses([]);
        }
      } catch (e) {
        console.error('[store] load error', e);
        // 실패해도 빈 배열로 계속 동작
        setHiddenProcesses([]);
      } finally {
        if (mounted) setStoreLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  // --- 스토리지 초기화.
  const resetStore = useCallback(async () => {
    try {
      const store = await Store.load('.settings.dat');
      await store.clear();
      await store.save();

      // 리셋된 리스트 훅에도 반영
      setHiddenProcesses([]);

      console.log('store reset completed.');
    } catch (err) {
      console.error('reset error:', err);
    }
  }, []);

  // --- hiddenProcesses가 바뀌면 store에 즉시 저장
  useEffect(() => {
    if (!storeRef.current) return;
    (async () => {
      try {
        await storeRef.current!.set('skipProcessNameList', hiddenProcesses);
        await storeRef.current!.save();
        fetchPorts();
        console.log('fetchPorts called...');
      } catch (e) {
        console.error('[store] save error', e);
      }
    })();
  }, [hiddenProcesses]);

  // --- 중복 제거 유틸 (Deduplication Utility)
  // Optimized using Map to ensure uniqueness by key (local_port + pid).
  const removeDuplicates = useCallback((list: PortInfo[]) => {
    const map = new Map<string, PortInfo>();
    for (const p of list) {
       const key = `${p.local_port}-${p.pid}`;
       if (!map.has(key)) {
         map.set(key, p);
       }
    }
    return Array.from(map.values());
  }, []);

  // --- 포트 조회 (항상 최신 hiddenProcesses를 사용하도록 dep에 포함)
  const fetchPorts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke<PortInfo[]>('get_ports');
      const unique = removeDuplicates(res ?? []);

      // 필터는 최신 hiddenProcesses 사용
      const filtered = unique.filter((pi) => {
        const name = pi.process_name ?? 'unknown';
        return !hiddenProcesses.includes(name);
      });

      setPorts(filtered);
    } catch (e) {
      console.error('fetchPorts error', e);
    } finally {
      setLoading(false);
    }
  }, [removeDuplicates, hiddenProcesses]);

  // --- 초기 로드시 store 로드가 끝난 뒤에 한번 페치 (원하면 storeLoaded 없이 바로 호출도 가능)
  useEffect(() => {
    if (!storeLoaded) return;
    fetchPorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeLoaded]);

  // --- portDict 갱신 (ports가 바뀔 때마다)
  useEffect(() => {
    const dict: PortInfoDict = ports.reduce((acc, port) => {
      const name = port.process_name || 'unknown';
      acc[name] ??= [];
      acc[name].push(port);
      return acc;
    }, {} as PortInfoDict);

    setPortDict(dict);
  }, [ports]);

  // [Moved] Polling Effect
  useEffect(() => {
    if (!storeLoaded) return;

    // Fixed polling interval to match local constant (3 seconds).
    const POLLING_INTERVAL_MS = 3000;
    const interval = setInterval(() => {
      fetchPorts();
    }, POLLING_INTERVAL_MS);

    // 언마운트 시 정리
    return () => clearInterval(interval);
  }, [storeLoaded, fetchPorts]);

  // --- 스킵 프로세스 추가 (stale-free 함수형 업데이트)
  const addSkipProcess = useCallback((process_name: string) => {
    setHiddenProcesses((prev) => {
      if (prev.includes(process_name)) return prev;
      const next = [...prev, process_name].sort((a, b) => a.localeCompare(b));
      return next;
    });
  }, []);

  // --- 스킵 프로세스 제거
  const removeSkipProcess = useCallback((process_name: string) => {
    setHiddenProcesses((prev) => prev.filter((p) => p !== process_name));
  }, []);

  return {
    portDict,
    ports,
    loading,
    hiddenProcesses,
    addSkipProcess,
    removeSkipProcess,
    refetch: fetchPorts,
    resetStore: resetStore,
    portCount: ports.length
  };
};

export default useSystemPort;
