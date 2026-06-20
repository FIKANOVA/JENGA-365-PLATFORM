import fs from 'fs';

let content = fs.readFileSync('src/lib/auth/config.ts', 'utf8');

content = content.replace(
`                await EmailService.sendPasswordReset(user.email, name, url);
            } catch (err) {`,
`                await EmailService.sendPasswordReset(user.email, name, url);
            } catch (err) {`
);

content = content.replace(
`        sendResetPassword: async ({ user, url }) => {`,
`        sendPasswordReset: async ({ user, url }) => {`
);

fs.writeFileSync('src/lib/auth/config.ts', content);
console.log('Fixed src/lib/auth/config.ts');
