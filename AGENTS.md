# Engineering Protocol: Betterleaks & Deslop

All automated agents, contributors, and AI assistants working on the **Jenga365 AI Platform** MUST adhere to this strict workflow before committing and pushing any changes.

## 1. Secrets & Leaks Scanning (Betterleaks)

Before any commit is staged or pushed:
- **Command (Staged changes):**
  ```bash
  betterleaks protect --staged --verbose --config=.betterleaks.toml
  ```
- **Command (Working Directory):**
  ```bash
  betterleaks dir --verbose .
  ```
- **Command (Git History):**
  ```bash
  betterleaks git --verbose
  ```
- **Requirement:** Must exit with code `0` and `no leaks found`. No secrets, keys, connection strings, or sensitive tokens may be committed under any circumstances.

## 2. Slop Removal & Code Hygiene (Deslop)

All code modified or created must remain completely free of AI-generated slop:
- **Automated Tool:**
  ```bash
  deslop
  ```
  *(Requires `CURSOR_API_KEY` configured in the environment or keychain)*

- **Deslop Quality Checklist:**
  1. **No Extra Comments:** Eliminate comments that merely restate what code does, contain emojis (`// 🔥`, `// ✨`), or rephrase function names.
  2. **No Defensive Bloat:** Do not introduce abnormal, redundant try/catch blocks or redundant null/undefined checks for values already validated upstream.
  3. **No Unwarranted `any` Casts:** Retain strict TypeScript types. Never use `as any` to hide legitimate type errors.
  4. **Codebase Style Consistency:** Match formatting, naming conventions, and patterns of adjacent code in the module.
  5. **No AI Documentation Fluff:** Do not introduce unrequested generic markdown summaries or boilerplate docs.
  6. **No Reinventing the Wheel:** Reuse existing helpers (`normalizeRole`, `hasCapability`, `getBaseUrl`, UI primitives, Drizzle schema) rather than writing duplicate implementations.
  7. **No UI Slop:** Never use unnatural Title/Start Case or misplaced emojis in UI buttons, titles, or badges.
