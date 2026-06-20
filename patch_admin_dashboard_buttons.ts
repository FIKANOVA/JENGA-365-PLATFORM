import fs from 'fs';

let content = fs.readFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', 'utf8');

const targetStr = `          <button
            onClick={() => run(() => suspendUser(userId), "suspended")}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-red-soft)] hover:text-[color:var(--brand-red)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <Ban className="w-4 h-4" /> Suspend
          </button>
        </div>
      )}
    </div>
  );
}`;

const replacementStr = `          {email && (
            <button
              onClick={() => {
                startTransition(async () => {
                  setOpen(false);
                  const { sendResetPasswordEmailAction } = await import("@/lib/actions/adminOps");
                  const res = await sendResetPasswordEmailAction(email);
                  if (res.error) toast.error(res.error);
                  else toast.success("Reset password email sent");
                });
              }}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-green-soft)] hover:text-[color:var(--brand-green)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              <Mail className="w-4 h-4" /> Password reset
            </button>
          )}
          <div className="h-px bg-border my-1" />
          <div className="px-3 py-1 text-xs font-semibold text-foreground-muted">Change Role</div>
          {["SuperAdmin", "Moderator", "CorporatePartner", "NGO", "Mentor", "Mentee"].map(role => role !== userRole && (
            <button
              key={role}
              onClick={() => {
                startTransition(async () => {
                  setOpen(false);
                  const { updateLegacyUserRoleAction } = await import("@/lib/actions/adminOps");
                  const res = await updateLegacyUserRoleAction(email!, role as any);
                  if (res.error) toast.error(res.error);
                  else { toast.success(\`Changed role to \${role}\`); onAction(); }
                });
              }}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--surface-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              {role}
            </button>
          ))}
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => run(() => suspendUser(userId), "suspended")}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-red-soft)] hover:text-[color:var(--brand-red)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <Ban className="w-4 h-4" /> Suspend
          </button>
        </div>
      )}
    </div>
  );
}`;

if (content.includes('sendResetPasswordEmailAction')) {
  console.log('Already added');
} else {
  if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/components/dashboard/Admin/AdminDashboard.tsx', content);
    console.log('Fixed src/components/dashboard/Admin/AdminDashboard.tsx');
  } else {
    console.log('Could not find target string');
  }
}
