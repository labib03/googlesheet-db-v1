# Task: Secure Admin Authentication (Options A, B, C Combined)

Implement a robust authentication system using server-side validation, password hashing, and encrypted stateless sessions.

## 🛠️ Tech Stack Changes

- **Password Hashing**: `bcryptjs`
- **Session Management**: `jose` (JWT in HTTP-only cookies)
- **Data Store**: Google Sheets (`Configuration` sheet for now, or new `Users` sheet)

## 📋 Steps

### 1. Installation

Install `bcryptjs` and `jose`.

### 2. Auth Service (`lib/auth-service.ts`)

- Functions for hashing and comparing passwords.
- Secret management via environment variables (add fallback for safety).
- JWT creation and verification.
- Cookie management functions.

### 3. Server Actions (`app/actions.ts`)

- `loginAdminAction(username, password)`:
  - Fetch users from Google Sheets.
  - Verify password hash.
  - Set secure HTTP-only cookie.
- `logoutAdminAction()`: Clear cookie.
- `verifySessionAction()`: Validate current session.

### 4. Component Updates

- **`components/admin-auth-gate.tsx`**:
  - Convert to use server actions for login.
  - Remove plain text password comparison.
  - Implement session check on mount.
- **`app/admin-restricted/layout.tsx`**:
  - Remove `correctPassword` prop.
  - Check session server-side for initial load.

### 5. Migration & Setup

- Create a script/utility to migrate the current `ADMIN_PASSWORD` to a hashed format.
- Plan for `ADMIN_USERS` key in Google Sheets to store multiple accounts as a JSON array.

## 🔒 Security Principles Applied

- **Option A (Server Validation)**: No sensitive logic in the browser.
- **Option B (Hashing)**: One-way hashing with salt (bcrypt).
- **Option C (Stateless Session)**: Encrypted JWT in HTTP-only, secure, samesite cookies.
