import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // No baseURL — Better Auth uses window.location.origin automatically.
    // Works on any deployment URL (production, preview, local) without config.
    plugins: [
        twoFactorClient()
    ]
});

export const { useSession, signIn, signOut, signUp } = authClient;
