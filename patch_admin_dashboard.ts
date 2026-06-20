import fs from 'fs';

let content = fs.readFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', 'utf8');

// The patch didn't apply UserActionMenu correctly since we used fuzz or inline regex. Let's do it right.
content = content.replace(
`function UserActionMenu({
  userId,
  onAction,
}: {
  userId: string;
  onAction: () => void;
}) {`,
`function UserActionMenu({
  userId,
  onAction,
  email,
  userRole,
}: {
  userId: string;
  onAction: () => void;
  email?: string;
  userRole?: string;
}) {`
);

fs.writeFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', content);
console.log('Fixed src/components/dashboard/Admin/AdminDashboard.tsx');
