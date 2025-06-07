// scripts/checkEnv.ts

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT is not defined.');
  process.exit(1);
}

console.log('✅ FIREBASE_SERVICE_ACCOUNT loaded. Preview:');
console.log(raw.slice(0, 80) + '...');

// 📦 To run:
// node -r dotenv/config scripts/checkEnv.ts
// (This loads your .env.local into process.env without changing your project setup.)
