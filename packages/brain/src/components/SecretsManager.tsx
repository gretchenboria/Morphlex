
import React, { useState } from 'react';
import { MCP_METHODS } from 'types';

interface SecretsManagerProps {
    sendMessage: (method: string, params: any) => void;
}

const SecretsManager: React.FC<SecretsManagerProps> = ({ sendMessage }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');

    const handleStoreSecret = () => {
        if (key && value) {
            sendMessage(MCP_METHODS.storeSecret, { key, value });
            // Don't clear key/value so user can see what they sent
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400">
                Securely store API keys and other secrets in your OS keychain. This requires the `ferri` CLI to be installed.
            </p>
            <div className="flex flex-col gap-2">
                <label htmlFor="secret-key" className="font-semibold text-gray-300 text-sm">Secret Key</label>
                <input
                    id="secret-key"
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g., GOOGLE_API_KEY"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="secret-value" className="font-semibold text-gray-300 text-sm">Secret Value</label>
                <input
                    id="secret-value"
                    type="password"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter secret value"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            <button
                onClick={handleStoreSecret}
                disabled={!key || !value}
                className="w-full px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md shadow-sm hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                Store Secret
            </button>
        </div>
    );
};

export default SecretsManager;
