"use client";

import { useState, useMemo } from "react";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { useSession } from "@/lib/auth/client";
import { useCart, CartProduct } from "@/lib/cartContext";
import { toast } from "sonner";
import { CheckCircle, X, Package } from "lucide-react";

interface OrderConfirmation {
    reference: string;
    items: { title: string; quantity: number; price: number }[];
    total: number;
    email: string;
}

export default function ShopClient({ initialProducts }: { initialProducts: CartProduct[] }) {
    const { data: session } = useSession();
    const { cartItems, cartTotal, cartQuantity, addToCart, removeFromCart, clearCart } = useCart();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [guestEmail, setGuestEmail] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

    const handleAddToCart = (product: CartProduct) => {
        addToCart(product);
        toast.success(`Added ${product.title} to cart`);
    };

    const handleCheckout = async () => {
        if (cartTotal <= 0) return;

        const donorEmail = session?.user?.email || guestEmail;
        if (!donorEmail) {
            toast.error("Please enter your email to continue");
            return;
        }

        setIsProcessing(true);
        const snapshot = cartItems.map(item => ({
            title: item.product.title,
            quantity: item.quantity,
            price: item.product.price,
        }));
        const snapshotTotal = cartTotal;

        const { default: PaystackPop } = await import("@paystack/inline-js");
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
            email: donorEmail,
            amount: cartTotal * 100, // kobo
            currency: "KES",
            metadata: {
                userId: session?.user?.id ?? null,
                type: "order",
                items: cartItems.reduce((acc, item) => ({ ...acc, [item.product._id]: item.quantity }), {}),
            },
            onSuccess: (transaction: { reference: string }) => {
                setIsProcessing(false);
                clearCart();
                setIsCartOpen(false);
                setOrderConfirmation({
                    reference: transaction.reference,
                    items: snapshot,
                    total: snapshotTotal,
                    email: donorEmail,
                });
            },
            onCancel: () => {
                setIsProcessing(false);
                toast.error("Checkout cancelled");
            },
        });
    };

    const categories = useMemo(() => {
        const cats = new Set<string>();
        initialProducts.forEach(p => { if (p.category) cats.add(p.category); });
        return ["All", ...Array.from(cats)];
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch =
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [initialProducts, search, selectedCategory]);

    return (
        <div className="min-h-screen bg-white">
            <main>
                {/* ── Header Section ── */}
                <PageHero
                    eyebrow="Impact Commerce"
                    heading={<>The <span className="italic text-primary">Jenga Store.</span></>}
                    description="Curated gear and strategic assets. Every purchase directly feeds into the Jenga365 Impact Fund, supporting community resilience."
                    bgImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1920&auto=format&fit=crop"
                    overlayOpacity={70}
                >
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary">
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search gear, apparel, or assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-sm rounded-sm py-5 pl-14 pr-8 text-white placeholder:text-white/40 placeholder:font-mono placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:border-primary transition-all font-sans"
                        />
                    </div>
                </PageHero>

                {/* ── Grid Section ── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
                    <div className="space-y-16">
                        {/* Category Selection */}
                        <div className="flex flex-col gap-6">
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Collections</span>
                            <div className="flex border-b border-[var(--border)] overflow-x-auto hide-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-8 py-5 text-[10px] font-bold tracking-[0.3em] whitespace-nowrap transition-all relative group ${selectedCategory === cat
                                            ? "text-[var(--primary-green)]"
                                            : "text-[var(--text-muted)] hover:text-black"
                                            }`}
                                        style={{ fontFamily: "var(--font-dm-mono)" }}
                                    >
                                        {cat.toUpperCase()}
                                        <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--primary-green)] transition-all duration-300 ${selectedCategory === cat ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="min-h-[600px]">
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                    {filteredProducts.map(product => (
                                        <div key={product._id} className="group flex flex-col bg-white border border-[var(--border)] transition-all duration-500 hover:border-black hover:shadow-2xl relative h-full rounded-sm overflow-hidden">
                                            {/* Visual Area */}
                                            <div className="relative h-80 bg-[var(--off-white)] overflow-hidden">
                                                {product.mainImage?.asset?.url ? (
                                                    <img
                                                        src={product.mainImage.asset.url}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-80"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-black/5 italic font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                                                        No Product Visual
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                    {product.stockStatus === "outOfStock" && (
                                                        <span className="px-2 py-1 bg-black text-white font-mono text-[8px] uppercase tracking-widest font-bold rounded-sm">
                                                            SOLD OUT
                                                        </span>
                                                    )}
                                                    {product.discountPrice && (
                                                        <span className="px-2 py-1 bg-[var(--primary-green)] text-white font-mono text-[8px] uppercase tracking-widest font-bold rounded-sm">
                                                            OFFER
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-8 flex-1 flex flex-col space-y-4 bg-white">
                                                <div className="space-y-2 flex-1">
                                                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--primary-green)]">
                                                        {product.category || "General"}
                                                    </span>
                                                    <h3 className="font-serif font-black text-xl text-black leading-tight group-hover:text-[var(--primary-green)] transition-colors duration-500 uppercase tracking-tighter">
                                                        {product.title}
                                                    </h3>
                                                </div>

                                                <div className="pt-6 border-t border-[var(--border)] flex flex-col gap-6">
                                                    <div className="flex items-end gap-3">
                                                        <span className="font-serif font-bold text-[13px] text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">KES</span>
                                                        <span className="font-serif font-black text-3xl text-black tracking-tighter transition-all duration-500 group-hover:text-[var(--primary-green)]">
                                                            {product.price?.toLocaleString() || 0}
                                                        </span>
                                                        {product.discountPrice && (
                                                            <span className="text-[var(--text-muted)] line-through text-xs mb-1 font-mono">
                                                                {product.discountPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.stockStatus === "outOfStock"}
                                                        className={`w-full h-12 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm shadow-sm ${product.stockStatus === "outOfStock"
                                                            ? "bg-[var(--off-white)] text-[var(--text-muted)] cursor-not-allowed"
                                                            : "bg-black text-white hover:bg-[var(--primary-green)]"
                                                            }`}
                                                    >
                                                        {product.stockStatus === "outOfStock" ? "NOT AVAILABLE" : "ADD TO CART"}
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {product.stockStatus === "outOfStock" ? "block" : "shopping_bag"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                                    <span className="material-symbols-outlined text-8xl text-[var(--border)]">production_quantity_limits</span>
                                    <div className="space-y-3">
                                        <h3 className="font-serif font-black text-4xl text-black uppercase tracking-tight">inventory empty</h3>
                                        <p className="text-[var(--text-muted)] font-light text-lg">Your search didn&apos;t match any items in our vault.</p>
                                    </div>
                                    <button
                                        onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                                        className="px-10 py-4 border border-[var(--border)] text-black font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm shadow-xl"
                                    >
                                        RESET EXPLORATION
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <section>
                    <FinalCTAStrip />
                </section>
            </main>

            {/* ── Cart Overlay ── */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="font-serif font-black text-2xl uppercase">Your Cart</h2>
                            <button onClick={() => setIsCartOpen(false)} className="material-symbols-outlined hover:text-[var(--red)] transition-colors">close</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="text-center text-[var(--text-muted)] flex flex-col items-center py-20">
                                    <span className="material-symbols-outlined text-6xl mb-4">shopping_bag</span>
                                    <p>Your cart is empty.</p>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.product._id} className="flex gap-4 border-b border-[var(--border)] pb-4">
                                        <div className="size-16 bg-[var(--off-white)] shrink-0">
                                            {item.product.mainImage?.asset?.url && (
                                                <img src={item.product.mainImage.asset.url} alt={item.product.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-serif font-bold text-sm uppercase leading-tight truncate">{item.product.title}</h4>
                                            <p className="text-[12px] text-[var(--text-muted)] mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between shrink-0">
                                            <span className="font-mono font-bold text-sm">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                                            <button onClick={() => removeFromCart(item.product._id)} className="text-[var(--red)] text-xs font-bold uppercase tracking-widest hover:underline">Remove</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-[var(--border)] bg-[var(--off-white)] space-y-6">
                                <div className="flex justify-between font-serif font-black text-xl uppercase">
                                    <span>Total</span>
                                    <span>KES {cartTotal.toLocaleString()}</span>
                                </div>

                                {!session?.user && (
                                    <div className="space-y-2">
                                        <label className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Your Email</label>
                                        <input
                                            placeholder="your@email.com"
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full bg-white border border-[var(--border)] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="w-full bg-black text-white font-mono uppercase tracking-widest h-14 hover:bg-[var(--primary-green)] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? "PROCESSING..." : "CHECKOUT WITH PAYSTACK"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Floating Cart Button ── */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-8 right-8 size-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[var(--primary-green)] hover:scale-110 transition-all z-40 group"
            >
                <div className="relative">
                    <span className="material-symbols-outlined group-hover:animate-bounce">shopping_cart</span>
                    {cartQuantity > 0 && (
                        <span className="absolute -top-2 -right-3 size-5 bg-[var(--red)] rounded-full text-[10px] flex items-center justify-center font-bold">
                            {cartQuantity}
                        </span>
                    )}
                </div>
            </button>

            {/* ── Order Confirmation Modal ── */}
            {orderConfirmation && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setOrderConfirmation(null)} />
                    <div className="relative bg-white w-full max-w-lg shadow-2xl rounded-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-[var(--primary-green)] p-8 text-white text-center space-y-3">
                            <CheckCircle className="mx-auto" size={48} strokeWidth={1.5} />
                            <h2 className="font-serif font-black text-3xl uppercase tracking-tighter">Order Confirmed!</h2>
                            <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">Thank you for supporting the Jenga365 Impact Fund</p>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-[var(--border)]">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Reference</span>
                                <span className="font-mono font-bold text-sm text-black tracking-wider">{orderConfirmation.reference}</span>
                            </div>

                            <div className="space-y-3">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold block">Items Ordered</span>
                                {orderConfirmation.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Package size={14} className="text-[var(--text-muted)] shrink-0" />
                                            <span className="font-sans text-sm text-black truncate">{item.title}</span>
                                            <span className="text-[var(--text-muted)] text-xs shrink-0">×{item.quantity}</span>
                                        </div>
                                        <span className="font-mono text-sm font-bold shrink-0">KES {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
                                <span className="font-serif font-black text-lg uppercase">Total Paid</span>
                                <span className="font-serif font-black text-2xl text-[var(--primary-green)]">KES {orderConfirmation.total.toLocaleString()}</span>
                            </div>

                            <p className="font-sans text-sm text-[var(--text-muted)] text-center leading-relaxed">
                                A confirmation has been sent to <span className="font-bold text-black">{orderConfirmation.email}</span>. We&apos;ll notify you when your order ships.
                            </p>

                            <button
                                onClick={() => setOrderConfirmation(null)}
                                className="w-full h-12 bg-black text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[var(--primary-green)] transition-all rounded-sm flex items-center justify-center gap-2"
                            >
                                <X size={14} />
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
