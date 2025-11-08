
import React from 'react';
import type { ConnectionStatus } from 'types';

interface StatusBarProps {
  status: ConnectionStatus;
  onConnect: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ status, onConnect }) => {
  const statusConfig = {
    Disconnected: { color: 'bg-gray-500', text: 'Disconnected' },
    Connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
    Connected: { color: 'bg-green-500', text: 'Connected' },
    Error: { color: 'bg-red-500', text: 'Error' },
  };

  const { color, text } = statusConfig[status];

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-sm font-medium text-gray-300">{text}</span>
      </div>
      <button
        onClick={onConnect}
        disabled={status === 'Connected' || status === 'Connecting'}
        className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md shadow-sm hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        Connect to VS Code
      </button>
    </div>
  );
};

export default StatusBar;
