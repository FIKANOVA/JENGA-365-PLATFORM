"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import FeedbackModal from "./FeedbackModal";

export type FeedbackCategory = "feature" | "bug" | "ui" | "general";

interface OpenFeedbackOptions {
    category?: FeedbackCategory;
    initialMessage?: string;
}

interface FeedbackContextType {
    isOpen: boolean;
    activeCategory: FeedbackCategory;
    openFeedback: (options?: OpenFeedbackOptions) => void;
    closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback(): FeedbackContextType {
    const ctx = useContext(FeedbackContext);
    if (!ctx) {
        return {
            isOpen: false,
            activeCategory: "general",
            openFeedback: () => {},
            closeFeedback: () => {},
        };
    }
    return ctx;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FeedbackCategory>("general");
    const [initialMessage, setInitialMessage] = useState<string>("");

    const openFeedback = useCallback((options?: OpenFeedbackOptions) => {
        if (options?.category) {
            setActiveCategory(options.category);
        }
        if (options?.initialMessage) {
            setInitialMessage(options.initialMessage);
        } else {
            setInitialMessage("");
        }
        setIsOpen(true);
    }, []);

    const closeFeedback = useCallback(() => {
        setIsOpen(false);
    }, []);

    const value = useMemo<FeedbackContextType>(
        () => ({
            isOpen,
            activeCategory,
            openFeedback,
            closeFeedback,
        }),
        [isOpen, activeCategory, openFeedback, closeFeedback]
    );

    return (
        <FeedbackContext.Provider value={value}>
            {children}
            {isOpen && (
                <FeedbackModal
                    initialCategory={activeCategory}
                    initialMessage={initialMessage}
                    onClose={closeFeedback}
                />
            )}
        </FeedbackContext.Provider>
    );
}
