'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italy',
    paymentMethod: 'card',
    saveInfo: false,
  });
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.22;
  const total = subtotal + shipping + tax;

  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color,
            campaignId: item.campaignId || '00560566',
          })),
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          shippingCost: shipping,
          tax: tax,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Clear cart before redirecting to Stripe
        clearCart();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && step === 1) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark py-20 px-5 mt-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-light">
            Il tuo carrello è vuoto
          </h1>
          <p className="text-dark/70 dark:text-light/70 mb-8">
            Aggiungi alcuni prodotti al carrello per continuare
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Torna allo store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark mt-36 pb-12 px-5">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-2">
            Checkout
          </h1>
          <p className="text-dark/70 dark:text-light/70">
            Completa il tuo ordine in pochi semplici passi
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step > s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                  Rivedi il tuo ordine
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.slug || item.productId}`}
                          className="font-semibold text-dark dark:text-light hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="text-sm text-dark/60 dark:text-light/60 mt-1">
                          {item.size && `Taglia: ${item.size}`} 
                          {item.size && item.color && ' | '}
                          {item.color && `Colore: ${item.color}`}
                          {!item.size && !item.color && 'Prodotto standard'}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              €{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-xs text-red-500 hover:text-red-600 mt-1"
                            >
                              Rimuovi
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Procedi al pagamento →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                  Dati di spedizione
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Cognome
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Indirizzo
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Città
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      CAP
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-dark dark:text-light">
                      Paese
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
                    >
                      <option value="Italy">Italia</option>
                      <option value="France">Francia</option>
                      <option value="Germany">Germania</option>
                      <option value="Spain">Spagna</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    ← Indietro
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Elaborazione...' : `Procedi al pagamento €${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                Riepilogo ordine
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark/70 dark:text-light/70">Subtotale</span>
                  <span className="font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark/70 dark:text-light/70">Spedizione</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratuita' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark/70 dark:text-light/70">IVA (22%)</span>
                  <span className="font-medium">€{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-dark/60 dark:text-light/60 text-center">
                  🚚 Spedizione gratuita per ordini superiori a €50
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}