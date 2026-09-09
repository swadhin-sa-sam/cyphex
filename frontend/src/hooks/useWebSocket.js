import { useState, useEffect, useRef, useCallback } from 'react';
export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const [latency, setLatency] = useState(0);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const connect = useCallback((url) => {
        if (wsRef.current?.readyState === WebSocket.OPEN)
            return;
        try {
            const ws = new WebSocket(url);
            ws.onopen = () => {
                setIsConnected(true);
                setError(null);
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                    if (data.latency_ms) {
                        setLatency(data.latency_ms);
                    }
                }
                catch (e) {
                    console.error("Failed to parse WS message", e);
                }
            };
            ws.onerror = (event) => {
                setError(event);
            };
            ws.onclose = () => {
                setIsConnected(false);
                if (!reconnectTimeoutRef.current) {
                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        connect(url);
                    }, 3000);
                }
            };
            wsRef.current = ws;
        }
        catch (err) {
            console.error("WS connect error", err);
        }
    }, []);
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);
    const sendBinary = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(data);
        }
    }, []);
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);
    return { isConnected, lastMessage, error, latency, connect, disconnect, sendBinary };
}
