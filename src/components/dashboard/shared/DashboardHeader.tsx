"use client";

import { Bell, MessageSquare, Search } from "lucide-react";
import React from "react";

export default function DashboardHeader() {
    return (
        <header className="flex items-center justify-between border-b border-border/50 px-8 py-4 bg-background shrink-0">
            <div className="flex-1 max-w-md">
                <label className="flex items-center bg-muted/50 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-primary focus-within:bg-background transition-all">
                    <Search className="text-muted-foreground mr-2 w-5 h-5" />
                    <input
                        type="text"
                        className="bg-transparent border-none focus:ring-0 text-sm w-full font-lato placeholder:text-muted-foreground outline-none"
                        placeholder="Search mentors, resources..."
                    />
                </label>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative text-muted-foreground hover:text-kenya-red transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-kenya-red rounded-full border-2 border-background"></span>
                </button>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-lato font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                </button>
            </div>
        </header>
    );
}
