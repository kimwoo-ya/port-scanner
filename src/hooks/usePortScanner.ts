import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to handle data fetching and polling for system ports.
 * Separated from persistence logic for clean separation of concerns.
 */
export const usePortScanner = (enabled: boolean = true) => {
    const [ports, setPorts] = useState<PortInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPorts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await invoke<PortInfo[]>('get_ports');
            setPorts(res ?? []);
        } catch (e) {
            console.error('fetchPorts error', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Polling Logic
    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchPorts();

        const POLLING_INTERVAL_MS = 1500;
        const interval = setInterval(() => {
            fetchPorts();
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [enabled, fetchPorts]);

    return {
        ports,
        loading,
        refetch: fetchPorts
    };
};
