
import React, { useRef, useEffect } from 'react';
import type { LogMessage, PlanStep } from 'types';
import { PlanStepStatus } from 'types';

interface PlanAndLogsProps {
  goal: string;
  setGoal: (goal: string) => void;
  onGeneratePlan: () => void;
  plan: PlanStep[];
  logs: LogMessage[];
  disabled: boolean;
  executionResult: string | null;
}

const PlanStepView: React.FC<{ step: PlanStep, index: number }> = ({ step, index }) => {
    const getStatusIndicator = (status: PlanStepStatus) => {
        switch(status) {
            case PlanStepStatus.Pending:
                return <span className="text-gray-400 text-xs">(Pending)</span>;
            case PlanStepStatus.Running:
                return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>;
            case PlanStepStatus.Success:
                return <span className="text-green-400 font-bold">✓</span>;
            case PlanStepStatus.Failed:
                return <span className="text-red-400 font-bold">✗</span>;
        }
    }
    
    return (
        <li className="flex items-start gap-3 py-2">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center pt-1">{getStatusIndicator(step.status)}</div>
            <div className="flex-1">
                <span className="font-mono text-sm text-gray-300">
                    <span className="font-bold text-cyan-400">{step.tool}:</span> {step.step}
                </span>
            </div>
        </li>
    );
};


const PlanAndLogs: React.FC<PlanAndLogsProps> = ({ goal, setGoal, onGeneratePlan, plan, logs, disabled, executionResult }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 mb-4">
        <label htmlFor="goal" className="font-semibold text-gray-300">Migration Goal:</label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Migrate from old Google Sign-In to new Firebase Auth SDK"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          rows={3}
          disabled={disabled}
        />
        <button
          onClick={onGeneratePlan}
          disabled={disabled || !goal}
          className="w-full px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md shadow-sm hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Generate Plan & Run
        </button>
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Execution Plan</h3>
            {plan.length > 0 ? (
                <ul className="bg-gray-700/50 p-4 rounded-md list-none">
                    {plan.map((step, index) => <PlanStepView key={index} step={step} index={index}/>)}
                </ul>
            ) : (
                <div className="bg-gray-700/50 p-4 rounded-md text-gray-400 text-sm">
                    Plan will appear here after generation.
                </div>
            )}
        </div>
        
        <div className="flex flex-col flex-grow min-h-0">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Live Logs</h3>
          <pre className="flex-grow bg-black text-white font-mono text-xs p-4 rounded-md overflow-y-auto min-h-[200px]">
            {logs.map((log, index) => (
              <div key={index} className={log.level === 'stderr' ? 'text-red-400' : 'text-gray-300'}>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}: </span>
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </pre>
          {executionResult && (
              <div className={`mt-2 p-2 rounded text-sm font-bold ${executionResult.startsWith('Success') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                  {executionResult}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanAndLogs;
