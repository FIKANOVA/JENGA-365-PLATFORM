import fs from 'fs';
let content = fs.readFileSync('src/lib/auth/config.ts', 'utf8');

content = content.replace(
`    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,`,
`    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 4,`
);

fs.writeFileSync('src/lib/auth/config.ts', content);
console.log('Fixed auth config');
