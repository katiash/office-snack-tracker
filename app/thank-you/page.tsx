export default function ThankYouPage() {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-4">✅ Thanks!</h1>
        <p className="mb-6">Your snack was logged successfully.</p>
        <a href="/" className="text-orange-600 underline">Log Another</a>
      </main>
    );
  }