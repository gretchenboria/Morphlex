# Morphlex: The AI Metaprogrammer

**Hackathon Project for "Automated integration and migration to Google SDKs"**

---

### 1. Impact (25%) — The Multi-Million Dollar Problem

**The Problem:** SDK integration and migration is a universal, expensive, and unsolved pain point for developers. It's a mire of API key management, deprecated endpoints, and high-risk manual refactoring. This "migration treadmill" forces developers to spend valuable time on maintenance instead of innovation.

*   **Fear & Toil:** Developers face a "Fear Tax" due to the risk of security vulnerabilities (leaked API keys) and breaking changes from platform updates.
*   **Inadequacy of Existing Tools:**
    *   **No-Code Platforms (Zapier, Retool):** Fail at refactoring existing, complex "brownfield" codebases.
    *   **Deterministic Codemods (jscodeshift):** Lack semantic, cross-file understanding. They are powerful but "blind" to an application's business logic and require expert-level knowledge to write.
    *   **Generalist AI Assistants (Copilot):** Suffer from the "Large Codebase" and "Stale Data" problems. They hallucinate, suggest deprecated code, and cannot reliably perform large-scale, multi-file refactoring.

**Our Solution's Impact:** Morphlex directly targets this multi-million dollar bottleneck. It is not just another chatbot that *suggests* code; it is an **autonomous AI agent that executes safe, deterministic, and complete migrations.** It saves countless developer hours, reduces security risks, and accelerates the adoption of new technologies like Gemini, solving a visceral, expensive, and unsolved problem for the entire Google ecosystem.

---

### 2. Demo (50%) — How It Works

Morphlex is a distributed system with a `Brain` (a web UI) and `Hands` (a local VS Code extension) that work together to perform migrations.

**The "Magic Demo" Workflow:**

1.  **Connect:** The user opens the Brain UI and connects it to their local VS Code environment where the Hands extension is running.
2.  **Multimodal Identification:** The user uploads a screenshot of their app's UI (e.g., an old "Sign in with Google" button).
    *   **Gemini Vision** analyzes the screenshot.
    *   The **Hands agent** securely scans the local codebase.
    *   **Gemini LLM** semantically matches the visual element to the corresponding React/Vue component file on disk. The identified file path appears in the UI.
3.  **AI-Generated Plan:** The user provides a high-level goal, such as "Migrate to the new Firebase Auth SDK."
    *   **Gemini** analyzes the component's code and the goal to generate a deterministic, step-by-step execution plan (e.g., `git checkout -b new-branch`, `npm install firebase`, `jscodeshift ...`, `npm run test`).
4.  **Deterministic Execution & Live Logs:** The user clicks "Run".
    *   The **Hands agent** executes each step in the user's local terminal. All `stdout` and `stderr` are streamed in real-time to the Brain's "Live Logs" panel.
5.  **Iterative Self-Correction (The Showstopper):** This is where Morphlex transcends simple scripting.
    *   If the `npm run test` step fails after the initial refactoring, the agent doesn't stop.
    *   It captures the test failure's `stderr` and sends it back to **Gemini**, along with the original code and the failed codemod script.
    *   Gemini generates a *new, corrected* codemod.
    *   The agent automatically reverts the changes, applies the new codemod, and re-runs the tests. This iterative, test-driven feedback loop ensures the final migration is correct and verified.

---

### 3. Creativity (15%) — The Core Innovation

Our project's creativity lies in its architecture, which fuses two distinct AI paradigms into a novel, superior solution.

**The "AI-as-Metaprogrammer" Concept:**

*   **The Flaw of Direct Refactoring:** Asking an LLM to directly rewrite a large, complex codebase is probabilistic and dangerous. It's prone to errors, hallucinations, and breaking subtle business logic.
*   **The Morphlex Innovation:** We **do not ask Gemini to write the new code.** Instead, we ask Gemini to write the *tool that writes the new code*—a `jscodeshift` script (the metaprogram).
    *   **Gemini** provides the semantic, cross-file understanding that codemods lack.
    *   **jscodeshift** provides the deterministic safety and scalability that AI assistants lack.

This fusion, combined with our test-driven **self-correction loop**, creates a powerful, reliable system that is smarter than generating fallible application code. It showcases Gemini's unique strengths: large context for whole-codebase analysis, multimodality for UI-to-code mapping, and advanced reasoning for metaprogramming and self-correction.

---

### How to Run the Project

**Prerequisites:**

*   Node.js and pnpm
*   Visual Studio Code
*   A Google Gemini API Key

**Setup:**

1.  **Clone the repository.**
2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure API Key:**
    *   Create a file named `.env` in the `packages/hands/` directory.
    *   Add your Gemini API key to the file:
        ```
        API_KEY="your_gemini_api_key_here"
        ```
4.  **Run the Extension:**
    *   Open the monorepo root folder in VS Code.
    *   Press `F5` to launch the Extension Development Host (a new VS Code window). The "Morphlex Hands" extension will be active in this new window, and its server will start automatically.
5.  **Run the Web UI (Brain):**
    *   In a terminal at the monorepo root, run:
    ```bash
    pnpm dev
    ```
    *   Open your browser to the local URL provided by Vite (usually `http://localhost:5173`).

**Usage:**

1.  In the web UI, click "Connect to VS Code". The status should change to "Connected".
2.  Follow the "Magic Demo" workflow described above.
