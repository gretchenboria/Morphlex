
import { GoogleGenAI, Type } from "@google/genai";
import type { PlanStep } from 'types';
import { PlanStepStatus } from 'types';

export class GeminiService {
    private ai: GoogleGenAI;

    constructor() {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set for Gemini.");
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    async findComponent(imageBase64: string, files: { filePath: string; fileContent: string }[]): Promise<string> {
        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: imageBase64,
            },
        };

        const textPart = {
            text: `
                You are an expert code analysis tool. I will provide you with a screenshot of a UI component and a list of source code files.
                Your task is to identify which source file most closely matches the provided screenshot.
                Analyze both the structure and content.
                Return ONLY the full file path of the best match. Do not provide any other text, explanation, or markdown formatting.

                Files:
                ${files.map(f => `--- FILE: ${f.filePath} ---\n${f.fileContent}`).join('\n\n')}
            `,
        };

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();
    }
    
    async generatePlan(fileContent: string, goal: string): Promise<PlanStep[]> {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `
                You are a senior software engineer creating a refactoring plan.
                Analyze the provided code and the user's goal.
                Generate a step-by-step plan as a JSON array. Each step must have a "step" description, a "tool" ('git', 'npm', 'jscodeshift', 'test', 'fs'), and "params" (an array of strings for the command).

                - Use 'jscodeshift' for code transformations. The 'params' should be ['-t', '<CODEMOD_PLACEHOLDER>', '<TARGET_FILE_PLACEHOLDER>'].
                - Use 'npm' for dependency management (e.g., install, uninstall).
                - Use 'git' for version control (e.g., creating a branch).
                - Use 'test' to run verification scripts (e.g., 'npm', 'run', 'test').

                Context:
                \`\`\`
                ${fileContent}
                \`\`\`

                Goal: ${goal}

                Return only the JSON array.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.STRING },
                            tool: { type: Type.STRING },
                            params: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["step", "tool", "params"]
                    }
                }
            }
        });

        const plan = JSON.parse(response.text.trim());
        return plan.map((p: any) => ({ ...p, status: PlanStepStatus.Pending }));
    }

    async generateCodemod(fileContent: string, planGoal: string): Promise<string> {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `You are a jscodeshift expert. Transform this code: \n\n${fileContent}\n\n to achieve this goal: "${planGoal}". Return *only* the raw JavaScript for the codemod. Do not include markdown fences or any explanations.`
        });
        return response.text.trim();
    }
    
    async generateCorrectedCodemod(originalCode: string, failedCodemod: string, testError: string): Promise<string> {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `
            You are a world-class debugging engineer specializing in jscodeshift codemods.
            The following codemod script failed to correctly refactor the original code.

            **Original Code:**
            \`\`\`javascript
            ${originalCode}
            \`\`\`

            **Failed Codemod Script:**
            \`\`\`javascript
            ${failedCodemod}
            \`\`\`

            **Test Error:**
            \`\`\`
            ${testError}
            \`\`\`

            Analyze the original code, the failed codemod, and the test error.
            Generate a new, corrected codemod script that fixes the issue and successfully performs the refactoring.

            Return *only* the raw, corrected JavaScript code for the new codemod. Do not include any explanations or markdown.
            `
        });
        return response.text.trim();
    }
}
