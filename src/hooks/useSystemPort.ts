import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from './useSettingsStore';
import { usePortScanner } from './usePortScanner';

/**
 * Custom hook to manage system ports.
 * REFACTORED: Now composes `useSettingsStore` and `usePortScanner` to separate concerns.
 *
 * @returns {object} An object containing port data, loading state, and control functions.
 */
export const useSystemPort = () => {
  const { hiddenProcesses, storeLoaded, addSkipProcess, resetStore, removeSkipProcess } = useSettingsStore();

  // Only start scanning once store is loaded to ensure we don't flash unhidden items
  const { ports: rawPorts, loading, refetch } = usePortScanner(storeLoaded);

  const [portDict, setPortDict] = useState<PortInfoDict>({});
  const [filteredPorts, setFilteredPorts] = useState<PortInfo[]>([]);

  // --- Deduplication Utility ---
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

  // --- Transformation & Filtering ---
  useEffect(() => {
      const unique = removeDuplicates(rawPorts);
      const filtered = unique.filter((pi) => {
          const name = pi.process_name ?? 'unknown';
          return !hiddenProcesses.includes(name);
      });
      setFilteredPorts(filtered);
  }, [rawPorts, hiddenProcesses, removeDuplicates]);


  // --- Port Dictionary Update ---
  useEffect(() => {
    const dict: PortInfoDict = filteredPorts.reduce((acc, port) => {
      const name = port.process_name || 'unknown';
      acc[name] ??= [];
      acc[name].push(port);
      return acc;
    }, {} as PortInfoDict);

    setPortDict(dict);
  }, [filteredPorts]);

  return {
    portDict,
    ports: filteredPorts,
    loading,
    hiddenProcesses,
    addSkipProcess,
    removeSkipProcess,
    refetch,
    resetStore,
    portCount: filteredPorts.length
  };
};

export default useSystemPort;
