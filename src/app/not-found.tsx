import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/marketing/Footer";

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <Header />
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                <h1 className="font-playfair font-black text-[120px] leading-none text-primary mb-4">
                    404
                </h1>
                <h2 className="font-playfair font-bold text-2xl md:text-3xl text-foreground mb-4">
                    Page Not Found
                </h2>
                <p className="font-lato text-muted-foreground max-w-md mb-8">
                    The page you're looking for doesn't exist or has been moved to another location.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="bg-primary text-white font-mono uppercase tracking-widest px-8 py-3 hover:opacity-90 transition-opacity"
                    >
                        Go to Homepage
                    </Link>
                    <Link
                        href="/dashboard"
                        className="border border-input text-foreground font-mono uppercase tracking-widest px-8 py-3 hover:border-primary transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
