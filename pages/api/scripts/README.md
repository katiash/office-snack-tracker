// scripts/README.md

# 🔧 Developer Scripts

This folder contains development and admin scripts for managing Firebase and local app utilities.

> **Important:** These scripts require your `.env.local` to contain a valid `FIREBASE_SERVICE_ACCOUNT` value (properly escaped JSON).

---

### ✅ `testFirebaseAdmin.ts`

Test Firebase Admin SDK connection and list 1 user.

**Run with:**
```bash
node -r dotenv/config scripts/testFirebaseAdmin.ts
```

**Purpose:**
- Confirms your `FIREBASE_SERVICE_ACCOUNT` is loading correctly
- Verifies Firebase Admin SDK access
- Prints first user's email from Firebase Auth

---

### ✍️ `setAdmin.js`

Interactive script to sync `isAdmin` field from Firestore to Firebase custom claims.

---

### 🔄 `syncAdminClaims.js`

Two-way sync between Firebase custom claims and Firestore `isAdmin` flags.
Supports `--dryRun` and `--syncMissingFirestoreFromClaim` flags for safety.

---

Let me know if you add more — we’ll keep this list updated!
