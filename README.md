# Morphlex: The AI Metaprogrammer

An autonomous AI agent that executes safe, deterministic, and complete codebase migrations by fusing the semantic understanding of Gemini with the deterministic power of metaprogramming.

---

### The Problem: The High Cost of Code Migration

Software development is in a constant state of evolution. For developers, this means a continuous "migration treadmill"—a cycle of updating codebases to adopt new SDKs, migrate from deprecated APIs, and patch security vulnerabilities. This process is fraught with challenges:

*   **High Risk & Toil:** Manual refactoring is tedious, time-consuming, and prone to human error. A single mistake can introduce subtle bugs or break critical functionality.
*   **Security Concerns:** Managing API keys and secrets during transitions is a major source of anxiety. A leaked key can lead to catastrophic security breaches and unexpected costs.
*   **Inadequate Tooling:**
    *   **Generalist AI Assistants (e.g., Copilot):** While useful for boilerplate, they struggle with large, complex codebases. They often suggest outdated or incorrect code based on their training data and cannot be trusted to perform reliable, large-scale refactoring.
    *   **Deterministic Codemods (e.g., jscodeshift):** These tools are powerful for code transformation but lack semantic understanding. They are "blind" to the overall context of the application and require specialized expertise to write, creating a high barrier to entry.

This friction represents a massive, multi-million dollar bottleneck across the industry, slowing down innovation and hindering the adoption of new technologies.

### The Solution: An AI-Powered Metaprogrammer

Morphlex is not another chatbot that *suggests* code. It is an **autonomous AI agent that executes safe, deterministic, and complete migrations.**

The core innovation is our **"AI-as-Metaprogrammer"** architecture. Instead of asking Gemini to directly rewrite application code (a probabilistic and risky task), we ask Gemini to write the *tool that writes the code*—a `jscodeshift` script.

This approach fuses the best of both worlds:
1.  **Gemini** provides the deep, semantic, and multi-modal understanding that traditional codemods lack.
2.  **jscodeshift** provides the deterministic safety and scalability that generalist AI assistants cannot guarantee.

Combined with a test-driven, iterative **self-correction loop**, Morphlex can intelligently plan, execute, and verify complex codebase migrations from start to finish.

---

### How It Works: The Agent Workflow

Morphlex consists of two parts: the **Brain** (a web-based UI) and the **Hands** (a VS Code extension that acts as a local agent).

1.  **Multimodal Target Identification:**
    *   A developer uploads a screenshot of a UI element in their application (e.g., an old "Sign in with Google" button).
    *   Using Gemini's multimodal capabilities, the agent analyzes the image and scans the local codebase to pinpoint the exact source file and component corresponding to that UI element.

2.  **AI-Generated Strategic Plan:**
    *   The developer provides a high-level goal (e.g., "Migrate this component to the new Firebase Auth SDK").
    *   Gemini analyzes the code and the goal to produce a step-by-step refactoring plan, including necessary commands for version control, dependency management, code transformation, and testing.

3.  **Deterministic Execution & Self-Correction:**
    *   The agent executes the plan step-by-step in the local environment, streaming live logs to the Brain UI.
    *   **The Showstopper:** If a `test` step fails after a codemod is applied, the agent doesn't give up. It enters a self-correction loop:
        *   It captures the test's error output.
        *   It feeds the error, the original code, and the failed codemod back to Gemini.
        *   Gemini generates a *new, corrected* codemod.
        *   The agent automatically reverts the code, applies the new codemod, and re-runs the tests.
    *   This iterative, test-driven process continues until the migration is successful and all tests pass.

---

### Getting Started

**Prerequisites:**

*   Node.js and **pnpm**
*   Visual Studio Code
*   A Google Gemini API Key

**Setup:**

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install All Dependencies:**
    ```bash
    pnpm install-all
    ```

3.  **Configure the API Key:**
    *   Navigate to the `packages/hands` directory.
    *   Create a new file named `.env`.
    *   Add your Gemini API key to this file:
        ```env
        API_KEY="your_gemini_api_key_here"
        ```

**Running the Application:**

1.  **Launch the VS Code Extension (Hands):**
    *   Open the root folder of the monorepo in VS Code.
    *   Press `F5` on your keyboard. This will open a new "Extension Development Host" window with the Morphlex Hands extension activated and its server running.

2.  **Launch the Web UI (Brain):**
    *   Open a terminal in the root folder of the monorepo.
    *   Run the unified development command:
        ```bash
        pnpm dev
        ```
    *   This command will start the Vite dev server. Open your web browser and navigate to the local URL it provides (e.g., `http://localhost:5173`).

You are now ready to use Morphlex! Connect the Brain to the Hands via the UI and begin your first automated migration.