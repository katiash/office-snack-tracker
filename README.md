# 🍿 Snack/Drink & Print Tracker App

This is a lightweight office tracking app built with **Next.js + Firebase** that lets team members:

- Log snacks, drinks, or print usage in a shared office/kitchen space
- View their personal totals
- Admins can manage users, export logs, and assign roles
- No email input required at login — just select your name and type your password!

---

## 🔐 Admin Auth System (via Firebase)

- Admins are managed with **Firebase custom claims** synced to Firestore `isAdmin` flags.
- Two utility scripts are provided to keep claims in sync:

### Scripts:
```bash
# Prompt-driven manual sync:
node scripts/setAdmin.js

# Smart sync with dry run option:
node scripts/syncAdminClaims.js --dryRun
# Optionally backfill missing Firestore values from claims:
node scripts/syncAdminClaims.js --syncMissingFirestoreFromClaim

🔧 Tech Stack
Next.js (App Router) for modern React UX
Firebase Auth for login/logout + roles
Firestore for user profiles and logs
Tailwind CSS for styling
CSV Export, admin gating, and persistent login state
🧠 Auth Guarding Logic
All permission-sensitive logic is deferred until onAuthStateChanged confirms login. We use a flag (canCheckAdmin) to:
-Prevent early Firestore reads
-Avoid Missing or insufficient permissions errors on logout
-Only call useAdminStatus() when we know the current user

✨ Features
✅ Instant login with name dropdown + password
✅ Admin-only snack/print logs dashboard
✅ Clean session management (no ghost reads)
✅ CSV export of logs by user/date
✅ Styled, responsive, and mobile-friendly


👉 See [QUICKSTART.md](./QUICKSTART.md) for setup and installation instructions.

🚧 Coming Soon
🔄 Date filters for snack logs
📈 Snack stats & charts
🧼 Cleanup script for unused users

🤝 Authors
Built with 💻 & ☕ by Katia Shukh
With Git support & Firebase wrestling assistance from ChatGPT 🧠