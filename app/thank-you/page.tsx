import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f6] text-center p-6">
      <div className="bg-white border border-gray-200 shadow-md rounded-xl px-6 py-8 max-w-sm w-full">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">✅ Thanks!</h1>
        <p className="text-gray-700 text-lg mb-6">Your item was logged successfully.</p>
        <Link
          href="/"
          className="inline-block bg-orange-500 text-white font-medium px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          Log Another
        </Link>
      </div>
    </main>
  );
}