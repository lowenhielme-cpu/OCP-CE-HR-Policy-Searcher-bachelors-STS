import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_BASE_URL } from '../config/api';

function useAgentSocket({ onNotice }) {
    const wsRef = useRef(null);
    const [isChatRunning, setIsChatRunning] = useState(false);

    const connectWebSocket = useCallback(() => {
        if (wsRef.current) return;

        const ws = new WebSocket(`${WS_BASE_URL}/api/agent/ws`);
        wsRef.current = ws;

        ws.onclose = () => {
            wsRef.current = null;
            setIsChatRunning(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsChatRunning(false);
            onNotice('error', 'Connection error.');
        };
    }, [onNotice]);

    useEffect(() => {
        const connectTimer = window.setTimeout(connectWebSocket, 0);

        return () => {
            window.clearTimeout(connectTimer);
            wsRef.current?.close();
        };
    }, [connectWebSocket]);

    return {
        wsRef,
        isChatRunning,
        setIsChatRunning,
    };
}

export default useAgentSocket;
