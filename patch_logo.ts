import fs from 'fs';

let content = fs.readFileSync('src/components/shared/Logo.tsx', 'utf8');

// The original arcs are:
// <path d="M40 28 A 150 62 0 0 1 252 22" ... />
// <path d="M260 68 A 150 62 0 0 1 48 74" ... />
// To make them more circular like the PNG, we need to increase the y-radius (62) or decrease x-radius (150).
// Wait, actually, let's just use simpler, more circular arcs.
// The user says "the svg logo should be more circular like the png".
// The current rx/ry is 150, 62.
// The user provided a screenshot of the PNG: it shows orbit arcs that are taller/more circular.
// Let's change the ry from 62 to 85.

content = content.replace(
    'd="M40 28 A 150 62 0 0 1 252 22"',
    'd="M40 28 A 150 85 0 0 1 252 22"'
);

content = content.replace(
    'd="M260 68 A 150 62 0 0 1 48 74"',
    'd="M260 68 A 150 85 0 0 1 48 74"'
);

fs.writeFileSync('src/components/shared/Logo.tsx', content);

let publicLogo = fs.readFileSync('public/jenga365-logo.svg', 'utf8');
publicLogo = publicLogo.replace('A 150 62 0 0 1 252 22', 'A 150 85 0 0 1 252 22');
publicLogo = publicLogo.replace('A 150 62 0 0 1 48 74', 'A 150 85 0 0 1 48 74');
fs.writeFileSync('public/jenga365-logo.svg', publicLogo);

console.log('Fixed logo');
