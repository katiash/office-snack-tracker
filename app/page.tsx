import AuthGuard from '@/components/AuthGuard';
import SnackForm from '@/components/SnackForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-orange-50 py-10">
      <AuthGuard>
        <SnackForm />
      </AuthGuard>
    </main>
  );
}