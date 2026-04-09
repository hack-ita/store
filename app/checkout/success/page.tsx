'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Component that uses useSearchParams must be wrapped in Suspense
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // You can add your verification logic here
  // For now, we'll just show success
  
  return (
    <main className="min-h-screen bg-light dark:bg-dark py-20 px-5 mt-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-dark dark:text-light">
          Grazie per il tuo ordine!
        </h1>
        <p className="text-dark/70 dark:text-light/70 mb-4">
          Il tuo pagamento è stato confermato con successo.
        </p>
        <p className="text-dark/60 dark:text-light/60 mb-8">
          Riceverai una email di conferma con i dettagli del tuo ordine.
        </p>
        
        {sessionId && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <p className="text-sm text-dark/60 dark:text-light/60">
              ID Transazione: <span className="font-mono text-xs">{sessionId}</span>
            </p>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Torna allo store
          </Link>
        </div>
      </div>
    </main>
  );
}

// Loading fallback while suspense is waiting
function SuccessLoading() {
  return (
    <main className="min-h-screen bg-light dark:bg-dark py-20 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-6 animate-spin">⏳</div>
        <h1 className="text-3xl font-bold mb-4 text-dark dark:text-light">
          Verifica del pagamento...
        </h1>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}