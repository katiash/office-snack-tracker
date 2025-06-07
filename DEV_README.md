👩‍💻 DEV_README: Firebase Snack App Schema & Roles

This document outlines the expected Firestore document shape for users, snack logs, and custom claims in Firebase Auth. It’s designed to help future collaborators or contributors understand what’s required vs. optional, and how roles are determined.

🧍‍♀️ User Record Schema (users/{uid})

✅ Required Fields
• These are expected immediately after signup:
• firstName: string
• lastName: string
• email: string  ← must match Firebase Auth email

🟡 Optional Fields
• These are populated post-signup, or defaulted:
• company: string
-Optional at signup
-Prompted later if not filled
• isAdmin: boolean
-Defaults to false
-Only true for users manually updated via script or Firestore
-Used to sync Firebase custom claims for admin views

🔐 Custom Claims (via Firebase Auth)
-We use Firebase Admin SDK scripts to sync the isAdmin field with Firebase Auth’s custom claims.
-Claim name: admin
-Location: user.customClaims.admin
-This controls access to:
• Admin dashboard /admin
• Firestore read access to snackLogs

📄 Snack Logs Schema (snackLogs/{docId})
-Each snack or drink log includes:
• userId: string ← must match auth.uid of the submitting user
• type: "snack" | "drink" | "print"
• timestamp: Timestamp ← auto-added at creation

📋 Firestore User Document Template
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "isAdmin": false,
  "company": "Main Office"
}
🔑 Notes:
-Replace "jane@example.com" with the exact email used in Firebase Auth.
-You must use the Firebase UID as the document ID in the users collection.
-You can set "isAdmin": true if you're granting admin access (needed for /admin and snack logs).
-"company" is optional and can be filled in later via the Profile modal in the UI.

🛑 Reminder: Firestore Rules
• All secure routes require request.auth != null, and admin reads require request.auth.token.admin == true.
• Users can only create their own snack log entries, and update their own user document.

🧠 Dev Tips
• Check ProfileModal.tsx to see when users are prompted to fill missing fields
• isAdmin is not required at signup — backend scripts apply it
• Use canCheckAdmin pattern to avoid triggering reads before auth is initialized

Need help? Reach out to the original creator or check the post-mortem doc for auth/firestore bugs.