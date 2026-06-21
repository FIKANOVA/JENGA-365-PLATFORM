import fs from 'fs';
let content = fs.readFileSync('src/lib/auth/config.ts', 'utf8');

content = content.replace(
`    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 4,`,
`    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 1, // Fix existing users with shorter passwords
        maxPasswordLength: 128,`
);

fs.writeFileSync('src/lib/auth/config.ts', content);
console.log('Fixed auth config 3');
