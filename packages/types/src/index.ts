
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
}

export interface LogMessage {
  level: 'stdout' | 'stderr' | 'info';
  message: string;
  timestamp: string;
}

export enum PlanStepStatus {
    Pending = 'Pending',
    Running = 'Running',
    Success = 'Success',
    Failed = 'Failed'
}

export interface PlanStep {
    step: string;
    tool: 'git' | 'npm' | 'jscodeshift' | 'test' | 'fs';
    params: any;
    status: PlanStepStatus;
}

export const MCP_METHODS = {
    findComponent: 'mcp:findComponentFromImage',
    generatePlan: 'mcp:generatePlan',
    storeSecret: 'mcp:storeSecret',
};

export const MCP_NOTIFICATIONS = {
    log: 'mcp:log',
    executionSuccess: 'mcp:executionSuccess',
    executionFailed: 'mcp:executionFailed',
    planGenerated: 'mcp:planGenerated',
    filePathFound: 'mcp:filePathFound',
    secretStored: 'mcp:secretStored',
    error: 'mcp:error',
    planStepUpdate: 'mcp:planStepUpdate'
};
