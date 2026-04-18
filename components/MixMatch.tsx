'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore';

interface MixMatchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  baseImage: string;
  colors: Array<{ name: string; code: string; colorClass: string; imageKey: string }>;
  sizes: string[];
  productCode: string;
  campaignId?: string;
}

interface SlotConfig {
  type: 'cap' | 'top' | 'bottom';
  label: string;
  subLabel: string;
  emoji: string;
  campaignId: string;
  iconBg: string;
}

interface SelectedVariant {
  product: MixMatchProduct;
  color: MixMatchProduct['colors'][0];
  size: string;
  displayImage: string;
}

const SLOTS: SlotConfig[] = [
  {
    type: 'cap',
    label: 'Cappellini',
    subLabel: 'Scegli il tuo copricapo',
    emoji: '🧢',
    campaignId: process.env.NEXT_PUBLIC_HOPLIX_CAMPAIGN_CAPS || '00560566',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    type: 'top',
    label: 'Top & Magliette',
    subLabel: 'Scegli la parte superiore',
    emoji: '👕',
    campaignId: process.env.NEXT_PUBLIC_HOPLIX_CAMPAIGN_TOPS || '00560566',
    iconBg: 'bg-teal-50 dark:bg-teal-900/20',
  },
  {
    type: 'bottom',
    label: 'Bottom & Pantaloni',
    subLabel: 'Scegli la parte inferiore',
    emoji: '👖',
    campaignId: process.env.NEXT_PUBLIC_HOPLIX_CAMPAIGN_BOTTOMS || '00560566',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

const BUNDLE_DISCOUNT = 0.10;
const FALLBACK_IMAGE = '/images/hero-1.png';

function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const key = Object.keys(preview[0]).find(k => k.startsWith('front-'));
  return key ? preview[0][key] : '';
}

// Variant Modal Component
interface VariantModalProps {
  type: string;
  product: MixMatchProduct;
  onConfirm: (type: string, variant: SelectedVariant) => void;
  onCancel: () => void;
}

function VariantModal({ type, product, onConfirm, onCancel }: VariantModalProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? null);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');

  const previewImage = selectedColor
    ? buildImageUrl(product.baseImage, selectedColor.imageKey) || product.baseImage || FALLBACK_IMAGE
    : product.image;

  function handleConfirm() {
    if (!selectedColor || !selectedSize) return;
    onConfirm(type, { product, color: selectedColor, size: selectedSize, displayImage: previewImage });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl">

        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Personalizza {product.name}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-primary text-2xl transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Live product preview */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-dark/10 dark:border-light/10">
              <Image key={previewImage} src={previewImage} alt={product.name} fill className="object-cover" unoptimized />
            </div>
          </div>

          {/* Color */}
          {product.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-dark dark:text-light">Colore</label>
                <span className="text-xs text-dark/50 dark:text-light/50">{selectedColor?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.code}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-150 ${
                      selectedColor?.code === color.code
                        ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                        : 'border-transparent hover:scale-105 hover:border-primary/40'
                    }`}
                    style={{ backgroundColor: color.code }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-dark dark:text-light">Taglia</label>
                <span className="text-xs text-dark/50 dark:text-light/50">{selectedSize && `Selezionata: ${selectedSize}`}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-11 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-150 ${
                      selectedSize === size
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-dark dark:text-light hover:bg-primary/15 hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm text-dark/60 dark:text-light/60">Prezzo</span>
            <span className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedColor || !selectedSize}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Conferma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MixMatch() {
  const [products, setProducts] = useState<Record<string, MixMatchProduct[]>>({
    cap: [], top: [], bottom: [],
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    cap: true, top: true, bottom: true,
  });
  const [selections, setSelections] = useState<Record<string, SelectedVariant | null>>({
    cap: null, top: null, bottom: null,
  });
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [pendingProduct, setPendingProduct] = useState<{ type: string; product: MixMatchProduct } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    SLOTS.forEach(async (slot) => {
      try {
        const res = await fetch(`/api/campaigns/${slot.campaignId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (data.campaign?.products) {
          const transformed: MixMatchProduct[] = data.campaign.products.map((p: any) => {
            const baseImage = getBaseImageFromPreview(p.preview);
            const firstColor = p['product-color']?.split(',')[0]?.trim().toLowerCase() || 'black';
            const mainImage = buildImageUrl(baseImage, firstColor) || baseImage || FALLBACK_IMAGE;

            const colors = (p['product-color'] || '').split(',')
              .map((c: string) => c.trim().toLowerCase()).filter(Boolean)
              .map((c: string) => ({ name: c.charAt(0).toUpperCase() + c.slice(1), code: c, colorClass: `bg-${c}`, imageKey: c }));

            const sizes = (p['product-size'] || '').split(',').map((s: string) => s.trim()).filter(Boolean);

            if (colors.length === 0) colors.push({ name: 'Black', code: 'black', colorClass: 'bg-black', imageKey: 'black' });
            if (sizes.length === 0) sizes.push('M');

            return {
              id: p['product-id'],
              name: p['product-name'],
              slug: p['product-name'].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
              price: parseFloat(p['product-price']),
              image: mainImage,
              baseImage,
              colors,
              sizes,
              productCode: p['product-code'],
              campaignId: slot.campaignId,
            };
          });

          setProducts(prev => ({ ...prev, [slot.type]: transformed }));
          
          // AUTO-SELECT first product with its first color and size
          if (transformed.length > 0 && !selections[slot.type]) {
            const firstProduct = transformed[0];
            const firstColor = firstProduct.colors[0];
            const firstSize = firstProduct.sizes[0];
            const displayImage = firstColor 
              ? buildImageUrl(firstProduct.baseImage, firstColor.imageKey) || firstProduct.baseImage || FALLBACK_IMAGE
              : firstProduct.image;
            
            setSelections(prev => ({
              ...prev,
              [slot.type]: {
                product: firstProduct,
                color: firstColor,
                size: firstSize,
                displayImage,
              }
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to load ${slot.type} products:`, err);
      } finally {
        setLoading(prev => ({ ...prev, [slot.type]: false }));
      }
    });
  }, []);

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const subtotal = Object.values(selections).reduce((sum, s) => sum + (s?.product.price || 0), 0);
  const allSelected = selectedCount === 3;
  const bundleTotal = allSelected ? subtotal * (1 - BUNDLE_DISCOUNT) : subtotal;
  const savings = allSelected ? subtotal * BUNDLE_DISCOUNT : 0;
  const progressPct = (selectedCount / 3) * 100;

  function handleProductClick(type: string, product: MixMatchProduct) {
    setPendingProduct({ type, product });
    setOpenPicker(null);
  }

  function handleVariantConfirm(type: string, variant: SelectedVariant) {
    setSelections(prev => ({ ...prev, [type]: variant }));
    setPendingProduct(null);
  }

  function handleTogglePicker(type: string) {
    setOpenPicker(prev => prev === type ? null : type);
  }

  function handleAddBundle() {
    if (!allSelected) return;
    setIsAdding(true);
    (['cap', 'top', 'bottom'] as const).forEach(type => {
      const s = selections[type];
      if (!s) return;
      addItem({
        id: `${s.product.id}_${s.color.imageKey}_${s.size}_mixmatch`,
        productId: s.product.id,
        name: `${s.product.name} — ${s.color.name} / ${s.size}`,
        price: s.product.price,
        image: s.displayImage,
        quantity: 1,
        slug: s.product.slug,
        campaignId: s.product.campaignId,
        size: s.size,
        color: s.color.name,
      });
    });
    setTimeout(() => setIsAdding(false), 1500);
  }

  function handleClearAll() {
    setSelections({ cap: null, top: null, bottom: null });
    setOpenPicker(null);
  }

  const SummaryContent = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 text-sm">
        {SLOTS.map((slot) => {
          const s = selections[slot.type];
          return (
            <div key={slot.type} className="flex justify-between items-center">
              {s ? (
                <>
                  <span className="text-dark/70 dark:text-light/70 truncate max-w-40">
                    {s.product.name}
                    <span className="text-dark/40 dark:text-light/40 ml-1 text-xs">{s.color.name} / {s.size}</span>
                  </span>
                  <span className="font-medium text-dark dark:text-light ml-2">€{s.product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-dark/30 dark:text-light/30 italic">— {slot.label}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-px bg-dark/10 dark:bg-light/10" />

      <div className="flex justify-between items-baseline">
        <div>
          <div className="text-sm text-dark/60 dark:text-light/60">Totale bundle</div>
          <div className="text-xs text-dark/40 dark:text-light/40 mt-0.5">{selectedCount} di 3 selezionati</div>
        </div>
        <div className="text-right">
          {allSelected && <div className="text-xs line-through text-dark/40 dark:text-light/40">€{subtotal.toFixed(2)}</div>}
          <div className="text-2xl font-bold text-dark dark:text-light">€{bundleTotal.toFixed(2)}</div>
        </div>
      </div>

      {allSelected && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2.5 text-center">
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">
            Risparmi €{savings.toFixed(2)} — 10% di sconto sul bundle
          </p>
        </div>
      )}

      <button
        onClick={handleAddBundle}
        disabled={!allSelected || isAdding}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          isAdding
            ? 'bg-primary/70 text-white cursor-wait'
            : allSelected
            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
            : 'bg-dark/5 dark:bg-light/5 text-dark/30 dark:text-light/30 cursor-not-allowed'
        }`}
      >
        {isAdding ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Aggiungo al carrello...
          </>
        ) : allSelected ? `Aggiungi bundle — €${bundleTotal.toFixed(2)}` : 'Seleziona tutti e 3 per sbloccare'}
      </button>

      {selectedCount > 0 && (
        <button onClick={handleClearAll} className="w-full text-xs text-dark/40 dark:text-light/40 hover:text-dark/70 dark:hover:text-light/70 transition-colors text-center">
          Cancella tutto
        </button>
      )}

      <p className="text-xs text-dark/40 dark:text-light/40 text-center">
        {allSelected ? 'Sconto bundle applicato al checkout' : `${3 - selectedCount} articolo${3 - selectedCount !== 1 ? 'i' : ''} rimanente${3 - selectedCount !== 1 ? 'i' : ''} per sbloccare il bundle`}
      </p>
    </div>
  );

  return (
    <>
      <section className="py-20 px-5 bg-light dark:bg-dark bg-mask">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-10">
            <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary mb-3 px-3 py-1 bg-primary/10 rounded-full">
              Mix &amp; Match
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-3">Crea il tuo look</h2>
            <p className="text-dark/60 dark:text-light/60 max-w-md mx-auto">
              Scegli un cappellino, un top e un bottom — ottieni il 10% di sconto sul bundle completo.
            </p>
          </div>

          <div className="max-w-xs mx-auto mb-10">
            <div className="flex justify-between text-xs text-dark/50 dark:text-light/50 mb-2">
              <span>{selectedCount} di 3 selezionati</span>
              {allSelected && <span className="text-green-600 dark:text-green-400 font-medium">Bundle sbloccato!</span>}
            </div>
            <div className="h-1.5 bg-dark/10 dark:bg-light/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mb-10">
            {SLOTS.map((slot, i) => (
              <div key={slot.type} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    selections[slot.type] ? 'bg-green-500 text-white'
                    : openPicker === slot.type ? 'bg-primary text-white'
                    : 'bg-dark/10 dark:bg-light/10 text-dark/50 dark:text-light/50'
                  }`}>
                    {selections[slot.type] ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:block transition-colors ${
                    selections[slot.type] ? 'text-green-600 dark:text-green-400 font-medium' : 'text-dark/50 dark:text-light/50'
                  }`}>{slot.label}</span>
                </div>
                {i < 2 && <div className="w-8 h-px bg-dark/20 dark:bg-light/20" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            <div className="flex flex-col gap-4 lg:col-span-2">
              {SLOTS.map((slot) => {
                const selected = selections[slot.type];
                const isOpen = openPicker === slot.type;
                const isLoadingSlot = loading[slot.type];
                const slotProducts = products[slot.type];

                return (
                  <div key={slot.type} className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-primary shadow-lg shadow-primary/10' : 'border-dark/10 dark:border-light/10'
                  }`}>
                    <button onClick={() => handleTogglePicker(slot.type)} className="w-full flex items-center justify-between p-4 text-left group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${slot.iconBg}`}>{slot.emoji}</div>
                        <div>
                          <div className="font-semibold text-dark dark:text-light text-sm">{slot.label}</div>
                          <div className="text-xs text-dark/50 dark:text-light/50">{slot.subLabel}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        isOpen ? 'bg-primary/10 text-primary'
                        : selected ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-dark/5 dark:bg-light/5 text-dark/50 dark:text-light/50 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        {isOpen ? 'Chiudi' : selected ? 'Cambia' : 'Sfoglia'}
                      </span>
                    </button>

                    {selected && !isOpen && (
                      <div className="flex items-center gap-3 px-4 pb-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-dark/10 dark:border-light/10 shrink-0 relative">
                          <Image src={selected.displayImage} alt={selected.product.name} fill className="object-cover" sizes="56px" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-dark dark:text-light truncate">{selected.product.name}</div>
                          <div className="text-xs text-dark/50 dark:text-light/50 mt-0.5">{selected.color.name} | Taglia: {selected.size}</div>
                        </div>
                        <div className="text-primary font-bold text-sm shrink-0">€{selected.product.price.toFixed(2)}</div>
                      </div>
                    )}

                    {!selected && !isOpen && (
                      <div className="flex items-center gap-3 px-4 pb-4">
                        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-dark/20 dark:border-light/20 flex items-center justify-center shrink-0">
                          <span className="text-dark/20 dark:text-light/20 text-lg">+</span>
                        </div>
                        <span className="text-sm text-dark/40 dark:text-light/40">Nessuna selezione</span>
                      </div>
                    )}

                    {isOpen && (
                      <div className="border-t border-dark/10 dark:border-light/10 bg-gray-50 dark:bg-gray-800/50 p-4">
                        {isLoadingSlot ? (
                          <div className="flex items-center justify-center py-8 gap-2 text-dark/50 dark:text-light/50 text-sm">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Caricamento prodotti...
                          </div>
                        ) : slotProducts.length === 0 ? (
                          <p className="text-center text-sm text-dark/40 dark:text-light/40 py-6">Nessun prodotto trovato</p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {slotProducts.map((product) => {
                              const isSelected = selections[slot.type]?.product.id === product.id;
                              return (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductClick(slot.type, product)}
                                  className={`rounded-xl border p-2.5 text-left transition-all duration-150 ${
                                    isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-dark/10 dark:border-light/10 bg-white dark:bg-gray-900 hover:border-primary/50'
                                  }`}
                                >
                                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative mb-2">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 30vw, 15vw" unoptimized />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">✓</div>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-dark dark:text-light leading-tight mb-1 line-clamp-2">{product.name}</p>
                                  <p className="text-xs text-primary font-bold">€{product.price.toFixed(2)}</p>
                                  <div className="flex gap-1 mt-1.5">
                                    {product.colors.slice(0, 4).map((c) => (
                                      <div key={c.code} className="w-2 h-2 rounded-full border border-dark/20" style={{ backgroundColor: c.code }} title={c.name} />
                                    ))}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-dark/10 dark:border-light/10 p-5">
                <SummaryContent />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dark/10 dark:border-light/10 p-5 flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-3">
              <h3 className="font-bold text-dark dark:text-light">Il tuo outfit</h3>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 min-h-40 justify-center">
                {selectedCount === 0 ? (
                  <p className="text-xs text-dark/40 dark:text-light/40 text-center">Seleziona gli articoli per visualizzare il tuo look</p>
                ) : (
                  <div className="flex flex-col items-center gap-1 w-full max-w-45">
                    {(['cap', 'top', 'bottom'] as const).map((type, i) => {
                      const s = selections[type];
                      const slot = SLOTS[i];
                      return (
                        <div key={type} className="w-full flex flex-col items-center gap-1">
                          {i > 0 && s && selections[SLOTS[i - 1].type] && (
                            <div className="w-px h-3 bg-dark/20 dark:bg-light/20" />
                          )}
                          {s ? (
                            <>
                              <span className="text-[9px] uppercase tracking-widest text-dark/40 dark:text-light/40">{type === 'cap' ? 'cappellino' : type === 'top' ? 'top' : 'bottom'}</span>
                              <div className="w-full aspect-square rounded-xl overflow-hidden relative border border-dark/10 dark:border-light/10">
                                <Image src={s.displayImage} alt={s.product.name} fill className="object-cover" sizes="180px" unoptimized />
                              </div>
                              <span className="text-[10px] text-dark/50 dark:text-light/50">{s.color.name} | {s.size}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] uppercase tracking-widest text-dark/30 dark:text-light/30">{type === 'cap' ? 'cappellino' : type === 'top' ? 'top' : 'bottom'}</span>
                              <div className="w-full aspect-square rounded-xl border-2 border-dashed border-dark/10 dark:border-light/10 flex items-center justify-center">
                                <span className="text-2xl opacity-30">{slot.emoji}</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:hidden">
                <SummaryContent />
              </div>
            </div>

          </div>
        </div>
      </section>

      {pendingProduct && (
        <VariantModal
          key={pendingProduct.product.id}
          type={pendingProduct.type}
          product={pendingProduct.product}
          onConfirm={handleVariantConfirm}
          onCancel={() => setPendingProduct(null)}
        />
      )}
    </>
  );
}