import fs from 'fs';

let content = fs.readFileSync('src/lib/auth/config.ts', 'utf8');

content = content.replace(
`        sendPasswordReset: async ({ user, url }) => {`,
`        sendPasswordReset: async ({ user, url }: { user: any, url: string }) => {`
);

fs.writeFileSync('src/lib/auth/config.ts', content);
console.log('Fixed src/lib/auth/config.ts');
