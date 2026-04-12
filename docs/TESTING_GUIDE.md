# Jenga365 AI Platform - Testing Guide

## Current Status
- ✅ App running at http://localhost:3000
- ✅ Header system working (auth-aware CTAs)
- ⏳ Database seed pending (connection timeout)

---

## Test Sequence

### Step 1: Guest User (Public Pages)
Navigate to http://localhost:3000 and verify:

| Element | Expected Behavior |
|---------|------------------|
| Header | Shows "Sign Up" and "Log In" buttons |
| Hero CTA | "Join Now" button visible |
| Footer | Links work correctly |

### Step 2: Registration Paths
Access these URLs directly:

| Role | Registration URL |
|------|------------------|
| Mentee | `/register/mentee` |
| Mentor | `/register/mentor` |
| Corporate | `/register/corporate` |

### Step 3: Login
- URL: `/login`
- After login, header should show avatar, role badge, and NO "Sign Up/Log In" buttons

---

## Manual SuperAdmin Setup

Since the database seed timed out, you can set up the SuperAdmin manually:

### Option 1: Use the Invite Link
The system has an existing admin-setup flow. Visit:
```
http://localhost:3000/admin-setup/[token]
```

### Option 2: Direct Database Insert
Run this SQL in your Neon console:

```sql
-- Insert SuperAdmin user
INSERT INTO users (
    id,
    email,
    name,
    role,
    email_verified,
    is_approved,
    nda_signed,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'nya.onmoseti@gmail.com',
    'Super Admin',
    'SuperAdmin',
    true,
    true,
    false,
    'active',
    NOW(),
    NOW()
);

-- Create invite link
INSERT INTO invite_links (
    id,
    inviter_id,
    token,
    role_assigned,
    is_used,
    expires_at,
    created_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'nya.onmoseti@gmail.com'),
    'your-token-here',
    'SuperAdmin',
    false,
    NOW() + INTERVAL '1 year',
    NOW()
);
```

Then visit: `http://localhost:3000/admin-setup/your-token-here`

---

## Testing Checklist

- [ ] Header - Guest view (no login)
- [ ] Header - Authenticated view (logged in)
- [ ] Registration - Mentee flow
- [ ] Registration - Mentor flow  
- [ ] Registration - Corporate Partner flow
- [ ] Login / Logout
- [ ] Dashboard access by role

---

## SuperAdmin Email
```
nya.onmoseti@gmail.com
```

After setting up the SuperAdmin, you can:
1. Create Moderators from the Admin Dashboard
2. Approve Mentor applications
3. Manage Corporate Partners

---

## Need Help?
The app is running - try refreshing the page or restarting the dev server:
```bash
pkill -f "next dev"
npm run dev
```
