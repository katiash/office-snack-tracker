🚀 Quickstart

1. Clone the repo

git clone https://github.com/your-org/snack-tracker-app.git
cd snack-tracker-app

2. Install dependencies

npm install

3. Setup your .env.local

Create a .env.local file in the root:

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

Get these values from your Firebase console under Project Settings.

🧱 Firebase Setup

1. Enable Firestore & Auth

Go to console.firebase.google.com
Create a project (if needed)
Enable Email/Password under Authentication > Sign-in method
Enable Cloud Firestore

2. Firestore Rules

Paste this into your Firebase Firestore rules panel:

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.token.admin == true || request.auth.uid == userId
      );
    }

    match /snackLogs/{docId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && request.auth.token.admin == true;
    }

    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
  }
}

3. Create initial user records

Each user must have a Firestore record under users/{uid} with:

{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  isAdmin: true // or false
}

4. Admin Claim Sync (optional)

Use the included syncAdminClaims.js script to sync Firestore isAdmin fields to Firebase custom claims.

node syncAdminClaims.js

🧪 Dev Commands

npm run dev      # Start local dev server
npm run build    # Build for production
npm run lint     # Lint code

💡 Architecture
Next.js 14 App Router
Firebase Auth + Firestore
Role-based access control using custom claims
Admin dashboard to view all logs
Member-facing form for snack & print entries

🔒 Auth Flow Summary
Users select their name from a dropdown
Password is entered (Email still tied to account)
Admins can view all logs, make other users admin, export CSV
Only authenticated users can log snacks

📫 Questions or Customization Help?
Want to adapt this to your office or team? Reach out!

🛠 Future Improvements
Kiosk mode (for iPad-style use)
Reimbursement calculations
Automated monthly reports

