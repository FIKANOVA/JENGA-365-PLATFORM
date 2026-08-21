import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '@/lib/email/service';
import { resend } from '@/lib/email/resend';

// Mock the resend client
vi.mock('@/lib/email/resend', () => ({
    resend: {
        emails: {
            send: vi.fn(),
        },
    },
    SENDER_ADDRESSES: {
        noreply: 'noreply@test.com',
    },
    DEFAULT_FROM: 'noreply@test.com',
}));

describe('EmailService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('safeSend behavior via sendRegistrationConfirmation', () => {
        it('should return success and messageId on a successful send', async () => {
            // Arrange
            const mockSend = resend.emails.send as any;
            mockSend.mockResolvedValueOnce({
                data: { id: 'msg_123' },
                error: null,
            });

            // Act
            const result = await EmailService.sendRegistrationConfirmation(
                'test@example.com',
                'John',
                'Mentor',
                'http://verify.url'
            );

            // Assert
            expect(result).toEqual({ success: true, messageId: 'msg_123' });
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'test@example.com',
                    subject: expect.stringContaining('John'),
                    from: 'noreply@test.com',
                })
            );
        });

        it('should return success: false and error message on standard Resend error', async () => {
            // Arrange
            const mockSend = resend.emails.send as any;
            mockSend.mockResolvedValueOnce({
                data: null,
                error: { message: 'Invalid API key' },
            });

            // Act
            const result = await EmailService.sendRegistrationConfirmation(
                'test@example.com',
                'John',
                'Mentor',
                'http://verify.url'
            );

            // Assert
            expect(result).toEqual({ success: false, error: 'Invalid API key' });
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should handle unhandled exceptions from resend SDK gracefully', async () => {
            // Arrange
            const mockSend = resend.emails.send as any;
            mockSend.mockRejectedValueOnce(new Error('Network disconnected'));

            // Act
            const result = await EmailService.sendRegistrationConfirmation(
                'test@example.com',
                'John',
                'Mentor',
                'http://verify.url'
            );

            // Assert
            expect(result).toEqual({ success: false, error: 'Network disconnected' });
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should attempt fallback to onboarding@resend.dev on domain verification errors', async () => {
            // Arrange
            const mockSend = resend.emails.send as any;

            // First call fails with domain error
            mockSend.mockResolvedValueOnce({
                data: null,
                error: { message: 'The domain is not verified on Resend.' },
            });

            // Second call (fallback) succeeds
            mockSend.mockResolvedValueOnce({
                data: { id: 'msg_fallback_123' },
                error: null,
            });

            // Act
            const result = await EmailService.sendRegistrationConfirmation(
                'test@example.com',
                'John',
                'Mentor',
                'http://verify.url'
            );

            // Assert
            expect(result).toEqual({ success: true, messageId: 'msg_fallback_123' });
            expect(mockSend).toHaveBeenCalledTimes(2);

            // Check first call was with default from
            expect(mockSend.mock.calls[0][0].from).toBe('noreply@test.com');

            // Check second call was with fallback from
            expect(mockSend.mock.calls[1][0].from).toBe('Jenga365 <onboarding@resend.dev>');
        });

        it('should fail if fallback also fails with an error', async () => {
            // Arrange
            const mockSend = resend.emails.send as any;

            // First call fails with domain error
            mockSend.mockResolvedValueOnce({
                data: null,
                error: { message: 'The domain is not verified on Resend.' },
            });

            // Second call (fallback) also fails
            mockSend.mockResolvedValueOnce({
                data: null,
                error: { message: 'Fallback failed too' },
            });

            // Act
            const result = await EmailService.sendRegistrationConfirmation(
                'test@example.com',
                'John',
                'Mentor',
                'http://verify.url'
            );

            // Assert
            expect(result).toEqual({ success: false, error: 'Fallback failed too' });
            expect(mockSend).toHaveBeenCalledTimes(2);
        });
    });
});
