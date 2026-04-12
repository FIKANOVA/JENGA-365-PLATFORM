"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartProduct {
    _id: string;
    title: string;
    category?: string;
    price: number;
    discountPrice?: number;
    stockStatus?: string;
    mainImage?: { asset?: { url: string } };
    description?: string;
}

export interface CartItem {
    product: CartProduct;
    quantity: number;
}

interface CartContextType {
    cart: Record<string, CartItem>;
    cartItems: CartItem[];
    cartTotal: number;
    cartQuantity: number;
    addToCart: (product: CartProduct) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "jenga365_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Record<string, CartItem>>({});

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            if (stored) setCart(JSON.parse(stored));
        } catch {
            // Ignore parse errors — start with empty cart
        }
    }, []);

    // Persist to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const addToCart = (product: CartProduct) => {
        setCart(prev => ({
            ...prev,
            [product._id]: {
                product,
                quantity: (prev[product._id]?.quantity ?? 0) + 1,
            },
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
        });
    };

    const clearCart = () => setCart({});

    return (
        <CartContext.Provider value={{ cart, cartItems, cartTotal, cartQuantity, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
