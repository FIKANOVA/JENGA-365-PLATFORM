"use client";

import { useDonate } from "@/components/shared/DonateProvider";

interface DonateButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    "aria-label"?: string;
    onAfterClick?: () => void;
}

/**
 * Trigger button that opens the shared donate modal hosted by DonateProvider.
 * The modal lives at app root so it survives unmount of this trigger (e.g.,
 * when a parent dropdown menu closes after the click).
 */
export default function DonateButton({ children, className, style, onAfterClick, ...rest }: DonateButtonProps) {
    const { openDonate } = useDonate();
    return (
        <button
            type="button"
            onClick={() => {
                openDonate();
                onAfterClick?.();
            }}
            className={className}
            style={style}
            aria-label={rest["aria-label"] ?? "Donate"}
        >
            {children}
        </button>
    );
}
