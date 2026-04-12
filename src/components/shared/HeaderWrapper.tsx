"use client";

import dynamic from "next/dynamic";

const Header = dynamic(
    () => import("@/components/shared/Header").then(mod => mod.default),
    {
        ssr: false,
        loading: () => (
            <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC] h-16 flex items-center px-6">
                <div className="h-10 w-32 bg-[#F5F5F5] animate-pulse rounded" />
            </header>
        )
    }
);

export default Header;
