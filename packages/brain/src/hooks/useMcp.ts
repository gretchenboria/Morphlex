
import { useState, useRef, useCallback, useEffect } from 'react';
import { ConnectionStatus } from 'types';
import type { JsonRpcRequest } from 'types';

interface McpNotification {
    method: string;
    params: any;
}

export const useMcp = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
    const [lastMessage, setLastMessage] = useState<McpNotification | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const requestId = useRef(0);

    const connect = useCallback(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

        setConnectionStatus(ConnectionStatus.Connecting);
        ws.current = new WebSocket('ws://localhost:3030');

        ws.current.onopen = () => {
            setConnectionStatus(ConnectionStatus.Connected);
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // We are only expecting notifications, not responses to requests
                if (message.method) {
                    setLastMessage(message);
                }
            } catch (error) {
                console.error('Failed to parse incoming message:', event.data);
                setConnectionStatus(ConnectionStatus.Error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setConnectionStatus(ConnectionStatus.Error);
        };

        ws.current.onclose = () => {
            setConnectionStatus(ConnectionStatus.Disconnected);
            ws.current = null;
        };
    }, []);
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            ws.current?.close();
        };
    }, []);

    const sendMessage = useCallback((method: string, params: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            const request: JsonRpcRequest = {
                jsonrpc: '2.0',
                id: requestId.current++,
                method,
                params,
            };
            ws.current.send(JSON.stringify(request));
        } else {
            console.error('WebSocket is not connected.');
        }
    }, []);

    return { connectionStatus, connect, sendMessage, lastMessage };
};
