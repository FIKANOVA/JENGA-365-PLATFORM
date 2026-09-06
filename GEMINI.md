# Workspace Rules: Betterleaks & Deslop Protocol

Before committing or pushing any changes to this repository:
1. Run Betterleaks to scan for leaked secrets or keys:
   - `betterleaks protect --staged --verbose --config=.betterleaks.toml`
   - `betterleaks dir --verbose .`
   - No commit may proceed if any leak is detected.

2. Run Deslop or verify code against the Deslop checklist:
   - Eliminate redundant comments and comments restating code.
   - Avoid abnormal defensive checks or unnecessary try/catches.
   - Retain clean TypeScript types without `any` bypasses.
   - Adhere to the established repository code and UI patterns.
