
import { spawn } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import type { PlanStep } from 'types';
import { MCP_NOTIFICATIONS, PlanStepStatus } from 'types';
import { GeminiService } from './services/geminiService';

type Notifier = (method: string, params: any) => void;

export class PlanExecutor {
    private notifier: Notifier = () => {};
    private tempDir: string | undefined;
    
    constructor(private geminiService: GeminiService) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.tempDir = path.join(workspaceFolders[0].uri.fsPath, '.morph');
        }
    }

    public setNotifier(notifier: Notifier) {
        this.notifier = notifier;
    }
    
    private log(level: 'stdout' | 'stderr' | 'info', message: string) {
        this.notifier(MCP_NOTIFICATIONS.log, { level, message });
    }

    private updateStepStatus(stepIndex: number, status: PlanStepStatus) {
        this.notifier(MCP_NOTIFICATIONS.planStepUpdate, { stepIndex, status });
    }

    private async runCommand(command: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
        return new Promise((resolve) => {
            this.log('info', `Running: ${command} ${args.join(' ')}`);
            const child = spawn(command, args, { cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath });
            
            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                const message = data.toString();
                stdout += message;
                this.log('stdout', message);
            });

            child.stderr.on('data', (data) => {
                const message = data.toString();
                stderr += message;
                this.log('stderr', message);
            });

            child.on('close', (code) => {
                resolve({ code, stdout, stderr });
            });

            child.on('error', (err) => {
                stderr += err.message;
                this.log('stderr', `Spawn error: ${err.message}`);
                resolve({ code: 1, stdout, stderr });
            });
        });
    }

    public async executePlan(plan: PlanStep[], targetFilePath: string) {
        if (!this.tempDir) {
            this.log('stderr', 'No workspace folder open.');
            this.notifier(MCP_NOTIFICATIONS.executionFailed, { error: 'No workspace folder open.' });
            return;
        }
        await fs.mkdir(this.tempDir, { recursive: true });

        const originalFileContent = (await fs.readFile(targetFilePath)).toString();
        let lastCodemodPath = '';
        let lastCodemodContent = '';

        for (let i = 0; i < plan.length; i++) {
            const step = plan[i];
            this.updateStepStatus(i, PlanStepStatus.Running);

            if (step.tool === 'jscodeshift') {
                this.log('info', 'Generating codemod script...');
                const codemodScript = await this.geminiService.generateCodemod(originalFileContent, step.step);
                lastCodemodContent = codemodScript;
                
                const codemodPath = path.join(this.tempDir, `codemod-${Date.now()}.js`);
                await fs.writeFile(codemodPath, codemodScript);
                lastCodemodPath = codemodPath;

                const params = step.params.map((p: string) => 
                    p === '<CODEMOD_PLACEHOLDER>' ? codemodPath : 
                    p === '<TARGET_FILE_PLACEHOLDER>' ? targetFilePath : p
                );
                
                const result = await this.runCommand('npx', ['jscodeshift', ...params]);
                if (result.code !== 0) {
                     this.handleFailure(i, `jscodeshift failed: ${result.stderr}`, plan);
                     return;
                }
            } else if (step.tool === 'test') {
                 const result = await this.runCommand(step.params[0], step.params.slice(1));
                 if (result.code !== 0) {
                    this.log('info', 'Tests failed. Analyzing errors and attempting self-correction...');
                    const correctedCodemod = await this.geminiService.generateCorrectedCodemod(originalFileContent, lastCodemodContent, result.stderr);
                    
                    this.log('info', 'Generated a corrected script. Retrying...');
                    await fs.writeFile(lastCodemodPath, correctedCodemod); // Overwrite old codemod
                    lastCodemodContent = correctedCodemod;
                    
                    // Restore original file and re-run jscodeshift and test
                    await fs.writeFile(targetFilePath, originalFileContent);
                    const jscodeshiftStepIndex = plan.findIndex(s => s.tool === 'jscodeshift');
                    const jscodeshiftStep = plan[jscodeshiftStepIndex];
                    const jscodeshiftParams = jscodeshiftStep.params.map((p: string) => 
                        p === '<CODEMOD_PLACEHOLDER>' ? lastCodemodPath : 
                        p === '<TARGET_FILE_PLACEHOLDER>' ? targetFilePath : p
                    );
                    
                    const jscsResult = await this.runCommand('npx', ['jscodeshift', ...jscodeshiftParams]);
                    if (jscsResult.code !== 0) {
                        this.handleFailure(i, `Corrected jscodeshift also failed: ${jscsResult.stderr}`, plan);
                        return;
                    }

                    const retestResult = await this.runCommand(step.params[0], step.params.slice(1));
                    if (retestResult.code !== 0) {
                        this.handleFailure(i, `Self-correction failed. Tests still failing: ${retestResult.stderr}`, plan);
                        return;
                    }
                    this.log('info', 'Self-correction successful! Tests passed.');
                 }
            } else {
                const result = await this.runCommand(step.params[0], step.params.slice(1));
                if (result.code !== 0) {
                    this.handleFailure(i, `Step failed: ${result.stderr}`, plan);
                    return;
                }
            }
            this.updateStepStatus(i, PlanStepStatus.Success);
        }
        
        this.notifier(MCP_NOTIFICATIONS.executionSuccess, { message: 'All tests passed!' });
    }

    private handleFailure(stepIndex: number, error: string, plan: PlanStep[]) {
        this.updateStepStatus(stepIndex, PlanStepStatus.Failed);
        for(let j = stepIndex + 1; j < plan.length; j++) {
            this.updateStepStatus(j, PlanStepStatus.Failed);
        }
        this.notifier(MCP_NOTIFICATIONS.executionFailed, { error });
    }
}
