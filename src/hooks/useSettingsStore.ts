import { Store } from '@tauri-apps/plugin-store';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage persistent settings using tauri-plugin-store.
 * Encapsulates loading, saving, and state management for hidden processes.
 */
export const useSettingsStore = () => {
    const [hiddenProcesses, setHiddenProcesses] = useState<string[]>([]);
    const [storeLoaded, setStoreLoaded] = useState(false);
    const storeRef = useRef<Store | null>(null);

    // Initial load
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
                    await store.set('skipProcessNameList', []);
                    await store.save();
                    setHiddenProcesses([]);
                }
            } catch (e) {
                console.error('[store] load error', e);
                setHiddenProcesses([]);
            } finally {
                if (mounted) setStoreLoaded(true);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    // Save on change
    useEffect(() => {
        if (!storeRef.current || !storeLoaded) return;
        (async () => {
            try {
                await storeRef.current!.set('skipProcessNameList', hiddenProcesses);
                await storeRef.current!.save();
            } catch (e) {
                console.error('[store] save error', e);
            }
        })();
    }, [hiddenProcesses, storeLoaded]);

    const resetStore = useCallback(async () => {
        try {
            if (!storeRef.current) {
                 storeRef.current = await Store.load('.settings.dat');
            }
            await storeRef.current!.clear();
            await storeRef.current!.save();
            setHiddenProcesses([]);
            console.log('store reset completed.');
        } catch (err) {
            console.error('reset error:', err);
        }
    }, []);

    const addSkipProcess = useCallback((process_name: string) => {
        setHiddenProcesses((prev) => {
            if (prev.includes(process_name)) return prev;
            return [...prev, process_name].sort((a, b) => a.localeCompare(b));
        });
    }, []);

    const removeSkipProcess = useCallback((process_name: string) => {
        setHiddenProcesses((prev) => prev.filter((p) => p !== process_name));
    }, []);

    return {
        hiddenProcesses,
        storeLoaded,
        addSkipProcess,
        removeSkipProcess,
        resetStore
    };
};
