
import React, { useState, useEffect, useCallback } from 'react';
import { useMcp } from './hooks/useMcp';
import type { LogMessage, PlanStep } from 'types';
import { MCP_NOTIFICATIONS } from 'types';
import StatusBar from './components/StatusBar';
import ImageUploader from './components/ImageUploader';
import PlanAndLogs from './components/PlanAndLogs';
import SecretsManager from './components/SecretsManager';

function App() {
  const { connectionStatus, connect, sendMessage, lastMessage } = useMcp();
  const [filePath, setFilePath] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [goal, setGoal] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  
  const addLog = useCallback((newLog: Omit<LogMessage, 'timestamp'>) => {
    setLogs(prev => [...prev, { ...newLog, timestamp: new Date().toISOString() }]);
  }, []);

  useEffect(() => {
    if (lastMessage) {
      console.log('Received message:', lastMessage);
      switch (lastMessage.method) {
        case MCP_NOTIFICATIONS.log:
          addLog(lastMessage.params);
          break;
        case MCP_NOTIFICATIONS.filePathFound:
          setFilePath(lastMessage.params.filePath);
          addLog({ level: 'info', message: `Found component file: ${lastMessage.params.filePath}` });
          break;
        case MCP_NOTIFICATIONS.planGenerated:
          setPlan(lastMessage.params.plan);
          setExecutionResult(null);
          addLog({ level: 'info', message: `Plan generated with ${lastMessage.params.plan.length} steps.` });
          break;
        case MCP_NOTIFICATIONS.planStepUpdate:
            setPlan(prevPlan => prevPlan.map((step, index) => 
                index === lastMessage.params.stepIndex ? { ...step, status: lastMessage.params.status } : step
            ));
            break;
        case MCP_NOTIFICATIONS.executionSuccess:
          setExecutionResult(`Success: ${lastMessage.params.message}`);
          addLog({ level: 'info', message: `Execution Succeeded: ${lastMessage.params.message}`});
          break;
        case MCP_NOTIFICATIONS.executionFailed:
          setExecutionResult(`Failed: ${lastMessage.params.error}`);
          addLog({ level: 'stderr', message: `Execution Failed: ${lastMessage.params.error}`});
          break;
        case MCP_NOTIFICATIONS.secretStored:
             addLog({ level: 'info', message: lastMessage.params.message });
             break;
        case MCP_NOTIFICATIONS.error:
            addLog({ level: 'stderr', message: `Error from server: ${lastMessage.params.message}` });
            break;
      }
    }
  }, [lastMessage, addLog]);

  const handleImageUpload = (imageBase64: string) => {
    addLog({ level: 'info', message: 'Image uploaded. Finding component...' });
    setFilePath(null);
    sendMessage('mcp:findComponentFromImage', { imageBase64 });
  };
  
  const handleGeneratePlan = () => {
    if (!filePath || !goal) {
      addLog({ level: 'stderr', message: 'Goal and a component file must be set to generate a plan.' });
      return;
    }
    setLogs([]);
    setPlan([]);
    addLog({ level: 'info', message: 'Generating plan...' });
    sendMessage('mcp:generatePlan', { goal, filePath });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-cyan-400">Morphlex</h1>
            <StatusBar status={connectionStatus} onConnect={connect} />
          </div>
          <p className="text-gray-400 mt-1">The AI Metaprogrammer for Deterministic Codebase Refactoring</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">1. Identify Component</h2>
              <ImageUploader onImageUpload={handleImageUpload} disabled={connectionStatus !== 'Connected'} />
              {filePath && (
                <div className="mt-4 p-3 bg-gray-700 rounded text-green-300 font-mono text-sm">
                  <span className="font-bold">Target File:</span> {filePath}
                </div>
              )}
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">Manage Secrets</h2>
                <SecretsManager sendMessage={sendMessage} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">2. Define & Execute Plan</h2>
            <PlanAndLogs 
              goal={goal}
              setGoal={setGoal}
              onGeneratePlan={handleGeneratePlan}
              plan={plan}
              logs={logs}
              disabled={!filePath || connectionStatus !== 'Connected'}
              executionResult={executionResult}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
