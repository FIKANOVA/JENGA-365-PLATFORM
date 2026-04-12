import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-[#FFF5F5] font-sans antialiased flex flex-col">
            <header className="w-full h-20 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50 px-6 md:px-10" data-purpose="main-navigation-header">
                <div className="flex items-center flex-shrink-0" data-purpose="logo-container">
                    <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
                        <Logo variant="symbol" showText theme="premium" height={32} priority />
                    </Link>
                </div>

                <div className="flex-grow flex justify-center" data-purpose="status-pill-container">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#FFAA00] bg-opacity-10 border border-[#FFAA00]/20" title="Your account is currently being verified by our team">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFAA00] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFAA00]"></span>
                        </span>
                        <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
                            Status: <span className="text-[#FFAA00]">Under Review</span>
                        </span>
                    </div>
                </div>

                <div className="hidden md:block w-[120px]" data-purpose="header-spacer"></div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto mt-16 px-6 text-center" data-purpose="pending-notice-content">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Hang tight! We&apos;re reviewing your application.</h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    Our team is currently verifying your details to ensure the highest security standards for the Jenga365 community.
                    This usually takes between 2-4 hours. You&apos;ll receive an email notification as soon as your account is active.
                </p>

                <div className="mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100 inline-block">
                    <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <h3 className="font-bold text-gray-800">High-Trust Verification</h3>
                        <p className="text-sm text-gray-500 max-w-xs mt-2">Your data is encrypted and handled with care according to our privacy policy.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
