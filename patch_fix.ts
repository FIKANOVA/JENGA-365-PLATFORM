import fs from 'fs';

// 1. Fix adminOps.ts
let adminOpsContent = fs.readFileSync('src/lib/actions/adminOps.ts', 'utf8');
adminOpsContent = adminOpsContent.replace(
    'await auth.api.requestPasswordReset({',
    'await auth.api.forgetPassword({'
);
fs.writeFileSync('src/lib/actions/adminOps.ts', adminOpsContent);
console.log('Fixed src/lib/actions/adminOps.ts');

// 2. Fix config.ts
let configContent = fs.readFileSync('src/lib/auth/config.ts', 'utf8');
configContent = configContent.replace(
    'sendPasswordReset: async ({ user, url }: { user: any, url: string }) => {',
    'sendResetPassword: async ({ user, url }: { user: any, url: string }) => {'
);
fs.writeFileSync('src/lib/auth/config.ts', configContent);
console.log('Fixed src/lib/auth/config.ts');

// 3. Fix AdminDashboard.tsx
let dashboardContent = fs.readFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', 'utf8');
if (!dashboardContent.includes('import { sendResetPasswordEmailAction, updateLegacyUserRoleAction }')) {
    dashboardContent = dashboardContent.replace(
        'import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";',
        'import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";\nimport { sendResetPasswordEmailAction, updateLegacyUserRoleAction } from "@/lib/actions/adminOps";'
    );
}

// Remove dynamic imports
dashboardContent = dashboardContent.replace(
    'const { sendResetPasswordEmailAction } = await import("@/lib/actions/adminOps");',
    ''
);
dashboardContent = dashboardContent.replace(
    'const { updateLegacyUserRoleAction } = await import("@/lib/actions/adminOps");',
    ''
);

fs.writeFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', dashboardContent);
console.log('Fixed src/components/dashboard/Admin/AdminDashboard.tsx');
