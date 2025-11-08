import * as vscode from 'vscode';
import { McpServer } from './mcpServer';
import * as dotenv from 'dotenv';
import * as path from 'path';

let mcpServer: McpServer;

export function activate(context: vscode.ExtensionContext) {
    // Load .env file from the extension's root directory (`packages/hands`)
    const envPath = path.join(context.extensionPath, '.env');
    dotenv.config({ path: envPath });

    console.log('Congratulations, your extension "hands" is now active!');
    
    // The McpServer constructor will throw an error if the API key is not found,
    // which will be caught by VS Code and reported to the user.
    // This prevents the server from starting in a broken state.
    try {
        mcpServer = new McpServer(context);
        mcpServer.start();
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to activate Morphlex Hands: ${(error as Error).message}`);
    }
}

export function deactivate() {
    if (mcpServer) {
        mcpServer.stop();
    }
}
