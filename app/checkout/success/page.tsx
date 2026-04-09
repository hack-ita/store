'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the payment with your backend
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrderStatus('success');
          } else {
            setOrderStatus('error');
          }
        })
        .catch(() => setOrderStatus('error'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setOrderStatus('error');
    }
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark py-20 px-5 mt-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-spin">⏳</div>
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-light">
            Verifica del pagamento...
          </h1>
        </div>
      </main>
    );
  }

  if (orderStatus === 'error') {
    return (
      <main className="min-h-screen bg-light dark:bg-dark py-20 px-5 mt-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-light">
            Pagamento non riuscito
          </h1>
          <p className="text-dark/70 dark:text-light/70 mb-8">
            Si è verificato un problema con il tuo pagamento. Riprova più tardi.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Torna al carrello
          </Link>
        </div>
      </main>
    );
  }

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
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 max-w-md mx-auto">
          <p className="text-sm text-dark/60 dark:text-light/60">
            ID Transazione: <span className="font-mono text-xs">{sessionId}</span>
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Torna allo store
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Vedi i miei ordini
          </Link>
        </div>
      </div>
    </main>
  );
}