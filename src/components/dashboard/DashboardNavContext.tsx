"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface DashboardNavContextType {
    isMobileOpen: boolean;
    isCollapsed: boolean;
    openMobile: () => void;
    closeMobile: () => void;
    toggleMobile: () => void;
    toggleCollapsed: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

const DashboardNavContext = createContext<DashboardNavContextType | undefined>(undefined);

const STORAGE_KEY = "jenga365_sidebar_collapsed";

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Restore desktop collapsed preference from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                setIsCollapsed(saved === "true");
            }
        } catch {
            // Ignore localStorage errors (e.g. incognito restrictions)
        }
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Close mobile drawer on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const openMobile = useCallback(() => setIsMobileOpen(true), []);
    const closeMobile = useCallback(() => setIsMobileOpen(false), []);
    const toggleMobile = useCallback(() => setIsMobileOpen((prev) => !prev), []);

    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                // Ignore storage errors
            }
            return next;
        });
    }, []);

    const setCollapsed = useCallback((collapsed: boolean) => {
        setIsCollapsed(collapsed);
        try {
            localStorage.setItem(STORAGE_KEY, String(collapsed));
        } catch {
            // Ignore storage errors
        }
    }, []);

    return (
        <DashboardNavContext.Provider
            value={{
                isMobileOpen,
                isCollapsed,
                openMobile,
                closeMobile,
                toggleMobile,
                toggleCollapsed,
                setCollapsed,
            }}
        >
            {children}
        </DashboardNavContext.Provider>
    );
}

export function useDashboardNav() {
    const context = useContext(DashboardNavContext);
    if (!context) {
        throw new Error("useDashboardNav must be used within a DashboardNavProvider");
    }
    return context;
}
