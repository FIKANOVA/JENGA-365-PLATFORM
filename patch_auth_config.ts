import fs from 'fs';

let content = fs.readFileSync('src/lib/auth/config.ts', 'utf8');

const replacement = `    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        password: {
            hash: async (password: string) => {
                const { hashPassword } = await import('@better-auth/utils/password');
                return await hashPassword(password);
            },
            verify: async ({ hash, password }: { hash: string, password: string }) => {
                // If it looks like a bcrypt hash (starts with $2), verify using bcrypt
                if (hash.startsWith('$2')) {
                    const { compare } = await import('bcrypt-ts');
                    return await compare(password, hash);
                }

                // Fallback to better-auth default verification for scrypt
                const { verifyPassword } = await import('@better-auth/utils/password');
                return await verifyPassword(hash, password);
            }
        },
        minPasswordLength: 1, // Fix existing users with shorter passwords
        maxPasswordLength: 128,`;

content = content.replace(
`    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        password: {
            hash: async (password: string) => {
                const { hashPassword } = await import('@better-auth/utils/password');
                return await hashPassword(password);
            },
            verify: async ({ hash, password }: { hash: string, password: string }) => {
                // If it looks like a bcrypt hash (starts with $2), verify using bcrypt
                if (hash.startsWith('$2')) {
                    const { compare } = await import('bcrypt-ts');
                    return await compare(password, hash);
                }

                // Fallback to better-auth default verification for scrypt
                const { verifyPassword } = await import('@better-auth/utils/password');
                return await verifyPassword(hash, password);
            }
        },
        minPasswordLength: 1, // Fix existing users with shorter passwords
        maxPasswordLength: 128,`,
replacement
);

fs.writeFileSync('src/lib/auth/config.ts', content);
console.log('Fixed auth config');
