"use client";

import { useState, useTransition } from "react";
import { upsertMerchandiseStock } from "@/lib/actions/merchandise";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface Props {
    sanityProductId: string;
    name: string;
    price: number;
    initialStock: number;
    initialActive: boolean;
}

export default function InventoryStockEditor({ sanityProductId, name, price, initialStock, initialActive }: Props) {
    const [stockCount, setStockCount] = useState(initialStock);
    const [isActive, setIsActive] = useState(initialActive);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const result = await upsertMerchandiseStock(sanityProductId, name, stockCount, isActive, price);
            if (result.success) {
                toast.success("Stock updated");
            } else {
                toast.error("Failed to update stock");
            }
        });
    };

    return (
        <div className="p-4 border-t border-gray-100 bg-[#FAFAF8] space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 flex-1">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-gray-400 font-bold">Stock Count</label>
                    <input
                        type="number"
                        min={0}
                        value={stockCount}
                        onChange={(e) => setStockCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-black transition-colors bg-white"
                    />
                </div>

                <div className="flex flex-col gap-1 items-center pt-4">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-gray-400 font-bold">Active</label>
                    <button
                        onClick={() => setIsActive(prev => !prev)}
                        className={`w-10 h-6 rounded-full transition-all duration-300 relative ${isActive ? "bg-[var(--primary-green)]" : "bg-gray-200"}`}
                        role="switch"
                        aria-checked={isActive}
                    >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isActive ? "left-5" : "left-1"}`} />
                    </button>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isPending}
                className="w-full h-9 bg-black text-white font-mono text-[9px] uppercase tracking-widest hover:bg-[var(--primary-green)] transition-all rounded flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isPending ? (
                    <><Loader2 size={12} className="animate-spin" /> Saving...</>
                ) : (
                    <><Check size={12} /> Save Stock</>
                )}
            </button>
        </div>
    );
}
