// scripts/README.md

# 🔧 Developer Scripts

This folder contains admin scripts for managing Firebase user roles and permissions.

> **Important:** These scripts require your `.env.local` or `service-account-key.json` to be configured correctly for Firebase Admin access.

---

### 🚀 `promote-admin.js`

Grants admin access to a user by setting the `isAdmin` Firebase custom claim based on their UID.

**Run with:**

```bash
node scripts/promote-admin.js <uid>

## ✅ Dev Notes

- Use `DEV_README.md` for:
  - User schema & Firestore expectations
  - Role-based access (e.g. `isAdmin`)
  - Firestore rules, auth claims, and more
- Scripts placed here must include `.env.local` usage instructions and clear purpose descriptions

---

📌 Keep this doc as a placeholder so future devs know where admin scripts belong.