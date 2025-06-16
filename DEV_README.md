👩‍💻 DEV_README: Firebase Snack App Schema & Roles

This document outlines the expected Firestore document shape for users, snack logs, and custom claims in Firebase Auth. It’s designed to help future collaborators or contributors understand what’s required vs. optional, and how roles are determined.

🧍‍♀️ User Record Schema (users/{uid})
✅ Required Fields
These are expected immediately after signup:
firstName: string
lastName: string
email: string ← must match Firebase Auth email

🟡 Optional Fields
These are populated post-signup or defaulted:
• company: string
- Optional at signup
- Prompted later if not filled
• isAdmin: boolean
- Defaults to false
- Only true for users manually updated via script or Firestore
- Used to sync Firebase custom claims for admin views

🔐 Custom Claims (via Firebase Auth)
We use Firebase Admin SDK scripts to sync the isAdmin field with Firebase Auth’s custom claims.
• Claim name: isAdmin  ✅
• Location: user.customClaims.isAdmin  ← must match in:
- Firestore security rules: request.auth.token.isAdmin
- Client logic: tokenResult.claims.isAdmin

This controls access to:
• Admin dashboard /admin
• Firestore read access to snackLogs

⚠️ Be careful not to confuse admin with isAdmin. We only use isAdmin now.
📄 Snack Logs Schema (snackLogs/{docId})
Each snack or drink log includes:
userId: string ← must match auth.uid of the submitting user
itemType: "snack" | "drink" | "print"
timestamp: Firestore Timestamp ← auto-added at creation
printType: optional, "bw" | "color" | null
count: number
subtotal, adminFee, total: number

📋 Firestore User Document Template
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "isAdmin": false,
  "company": "Main Office"
}

🔑 Notes:
• Replace jane@example.com with the exact email used in Firebase Auth.
• You must use the Firebase UID as the document ID in the users collection.
• You can set isAdmin: true if you're granting admin access.
• company is optional and can be filled later via the Profile modal in the UI.

🛑 Reminder: Firestore Rules
function isAdmin() {
  return request.auth != null && request.auth.token.isAdmin == true;
}

• All secure routes require request.auth != null
• Admin reads require request.auth.token.isAdmin == true
• Users can only create their own snack log entries, and update their own user document

🧠 Dev Tips
• isAdmin is not required at signup — backend scripts apply it
• Check ProfileModal.tsx for logic around prompting missing user fields
• Admin view is controlled by useAdminStatus.ts on the client side
• Claim mismatch is a common source of bugs: always force-refresh tokens after promotion

🔧 Admin Tools & Debugging

✅ Promote Admin via Script (server-only)
node scripts/promote-admin.js <uid>
This uses the Firebase Admin SDK to set:
customClaims: { "isAdmin": true }

✅ Debug Current User (client-side)
Visit:
http://localhost:3000/debug-auth
This forces a token refresh and logs the current user's claims to the console.

✅ Check Any User's Claims (server-only)
Visit:
http://localhost:3000/api/debug-claims?uid=<uid>
Returns:

{
  "uid": "...",
  "email": "...",
  "customClaims": { "isAdmin": true }
}

🧭 Troubleshooting Admin Access

"Access Denied" in /admin after promoting user?
Make sure to:
1. Run setCustomUserClaims with isAdmin key ✅
2. Log out and log back in (token must refresh)
3. Firebase rules must check request.auth.token.isAdmin
4. useAdminStatus.ts must check .claims.isAdmin, not .admin

If stuck:
• Check /debug-auth while logged in
• Check /api/debug-claims?uid=... to confirm backend sees it too
• Re-run the promote script manually

Need help? Check the original creator's GitHub or Notion workspace for postmortems and architecture notes.