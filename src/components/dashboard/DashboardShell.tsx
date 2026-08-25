"use client";

import React from "react";
import { DashboardNavProvider } from "./DashboardNavContext";
import RoleSidebar from "./RoleSidebar";
import DashboardHeader from "./shared/DashboardHeader";
import BottomNavBar from "./BottomNavBar";

interface DashboardShellProps {
    role: string;
    children: React.ReactNode;
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
    return (
        <DashboardNavProvider>
            <div className="flex h-screen overflow-hidden bg-muted/5 antialiased">
                {/* Responsive Desktop Sidebar & Mobile Drawer */}
                <RoleSidebar role={role} />

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <DashboardHeader role={role} />
                    <main className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-6 focus:outline-none">
                        {children}
                    </main>
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <BottomNavBar role={role} />
            </div>
        </DashboardNavProvider>
    );
}
