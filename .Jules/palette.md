## 2026-06-20 - Add ARIA label to Floating Cart Button
**Learning:** Found an accessibility issue where the floating cart button in `src/components/marketing/ShopClient.tsx` lacked an `aria-label`. As an icon-only button, it was inaccessible to screen reader users.
**Action:** Always verify that icon-only interactive elements like buttons have a descriptive `aria-label` or `aria-labelledby` attribute for better accessibility.
