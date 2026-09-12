import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    sendMenteeRegistrationEmail,
    sendMentorRegistrationEmails,
    sendCorporateRegistrationEmails,
} from '@/lib/actions/registration-emails';
import { EmailService } from '@/lib/email/service';

vi.mock('@/lib/email/service', () => ({
    EmailService: {
        sendNDASignedConfirmation: vi.fn().mockResolvedValue({ success: true }),
        sendRegistrationConfirmation: vi.fn().mockResolvedValue({ success: true }),
        sendMentorPendingApproval: vi.fn().mockResolvedValue({ success: true }),
        sendCorporatePendingApproval: vi.fn().mockResolvedValue({ success: true }),
    },
}));

vi.mock('@/lib/utils/url', () => ({
    getBaseUrl: vi.fn(() => 'http://localhost:3000'),
}));

describe('registration-emails', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('sendMenteeRegistrationEmail', () => {
        it('should call EmailService.sendNDASignedConfirmation with correct arguments', async () => {
            await sendMenteeRegistrationEmail(
                'mentee@example.com',
                'Jane',
                'Doe',
                'hash123',
                'sig123'
            );

            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledTimes(1);
            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledWith(
                'mentee@example.com',
                'Jane',
                'Mentee',
                'Jane Doe',
                'hash123',
                'sig123'
            );
        });

        it('should catch errors and log them to console.error', async () => {
            const error = new Error('Mentee email failed');
            vi.mocked(EmailService.sendNDASignedConfirmation).mockRejectedValueOnce(error);

            await sendMenteeRegistrationEmail(
                'mentee@example.com',
                'Jane',
                'Doe',
                'hash123',
                'sig123'
            );

            expect(consoleErrorSpy).toHaveBeenCalledWith('Mentee email delivery failed:', error);
        });
    });

    describe('sendMentorRegistrationEmails', () => {
        it('should call all three email services with correct arguments', async () => {
            await sendMentorRegistrationEmails(
                'mentor@example.com',
                'John',
                'Smith',
                'Senior Developer',
                'hash456',
                'sig456',
                '2023-10-01'
            );

            expect(EmailService.sendRegistrationConfirmation).toHaveBeenCalledTimes(1);
            expect(EmailService.sendRegistrationConfirmation).toHaveBeenCalledWith(
                'mentor@example.com',
                'John',
                'Mentor',
                'http://localhost:3000/verify-email'
            );

            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledTimes(1);
            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledWith(
                'mentor@example.com',
                'John',
                'Mentor',
                'John Smith',
                'hash456',
                'sig456'
            );

            expect(EmailService.sendMentorPendingApproval).toHaveBeenCalledTimes(1);
            expect(EmailService.sendMentorPendingApproval).toHaveBeenCalledWith(
                'mentor@example.com',
                'John',
                'John Smith',
                'Senior Developer',
                '2023-10-01'
            );
        });

        it('should catch errors and log them to console.error', async () => {
            const error = new Error('Mentor email failed');
            vi.mocked(EmailService.sendRegistrationConfirmation).mockRejectedValueOnce(error);

            await sendMentorRegistrationEmails(
                'mentor@example.com',
                'John',
                'Smith',
                'Senior Developer',
                'hash456',
                'sig456',
                '2023-10-01'
            );

            expect(consoleErrorSpy).toHaveBeenCalledWith('Mentor email delivery failed:', error);
        });
    });

    describe('sendCorporateRegistrationEmails', () => {
        it('should call all three email services with correct arguments', async () => {
            await sendCorporateRegistrationEmails(
                'corp@example.com',
                'Alice Corp',
                'Tech Corp',
                'hash789',
                'sig789',
                '2023-10-02'
            );

            expect(EmailService.sendRegistrationConfirmation).toHaveBeenCalledTimes(1);
            expect(EmailService.sendRegistrationConfirmation).toHaveBeenCalledWith(
                'corp@example.com',
                'Alice Corp',
                'Corporate Partner',
                'http://localhost:3000/verify-email'
            );

            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledTimes(1);
            expect(EmailService.sendNDASignedConfirmation).toHaveBeenCalledWith(
                'corp@example.com',
                'Alice Corp',
                'Corporate Partner',
                'Alice Corp (Tech Corp)',
                'hash789',
                'sig789'
            );

            expect(EmailService.sendCorporatePendingApproval).toHaveBeenCalledTimes(1);
            expect(EmailService.sendCorporatePendingApproval).toHaveBeenCalledWith(
                'corp@example.com',
                'Alice Corp',
                'Tech Corp',
                '2023-10-02'
            );
        });

        it('should catch errors and log them to console.error', async () => {
            const error = new Error('Corporate email failed');
            vi.mocked(EmailService.sendRegistrationConfirmation).mockRejectedValueOnce(error);

            await sendCorporateRegistrationEmails(
                'corp@example.com',
                'Alice Corp',
                'Tech Corp',
                'hash789',
                'sig789',
                '2023-10-02'
            );

            expect(consoleErrorSpy).toHaveBeenCalledWith('Corporate email delivery failed:', error);
        });
    });
});
