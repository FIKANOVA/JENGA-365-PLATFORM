import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventsGrid from '@/components/marketing/EventsGrid';

vi.mock('@/lib/auth/client', () => ({
    useSession: () => ({ data: null, isPending: false }),
}));

describe('EventsGrid', () => {
    it('renders event iframe securely and filters out malicious scripts', () => {
        const maliciousEvent = {
            _id: '123',
            lumaEventIframe: '<iframe src="https://lu.ma/event" class="valid-iframe"></iframe><script>alert("XSS")</script><img src="x" onerror="alert(1)" />'
        };

        const { container } = render(
            <EventsGrid events={[maliciousEvent]} registeredEventIds={[]} />
        );

        const iframe = container.querySelector('iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://lu.ma/event');
        expect(iframe).toHaveAttribute('class', 'valid-iframe');

        const script = container.querySelector('script');
        expect(script).not.toBeInTheDocument();

        const img = container.querySelector('img');
        if (img) {
            expect(img).not.toHaveAttribute('onerror');
        } else {
            expect(img).not.toBeInTheDocument();
        }
    });
});
