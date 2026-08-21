import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventsPageClient from '@/app/(marketing)/events/EventsPageClient';

// Mock components that we are not testing here to simplify rendering
vi.mock('@/components/marketing/EventsGrid', () => ({
    default: () => <div data-testid="events-grid">Events Grid</div>,
}));
vi.mock('@/components/marketing/FinalCTAStrip', () => ({
    default: () => <div data-testid="final-cta-strip">Final CTA Strip</div>,
}));
vi.mock('@/components/shared/PageHero', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-hero">{children}</div>
    ),
}));

describe('EventsPageClient', () => {
    it('renders iframe securely and filters out malicious scripts', () => {
        const maliciousIframeHtml = '<iframe src="https://example.com" allowfullscreen class="valid-iframe"></iframe><script>alert("XSS")</script><img src="x" onerror="alert(1)" />';

        const { container } = render(
            <EventsPageClient initialEvents={[]} lumaCalendarIframe={maliciousIframeHtml} />
        );

        // Check that iframe exists with allowed attributes
        const iframe = container.querySelector('iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://example.com');
        expect(iframe).toHaveAttribute('class', 'valid-iframe');

        // Check that script and malicious handlers are removed
        const script = container.querySelector('script');
        expect(script).not.toBeInTheDocument();

        // DOMPurify removes the whole img tag or just the onerror, let's verify onerror is gone
        const img = container.querySelector('img');
        if (img) {
            expect(img).not.toHaveAttribute('onerror');
        } else {
            // It might just strip img altogether if not allowed
            expect(img).not.toBeInTheDocument();
        }
    });

    it('does not render iframe section if lumaCalendarIframe is not provided', () => {
        const { container } = render(<EventsPageClient initialEvents={[]} />);
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeInTheDocument();
    });
});
