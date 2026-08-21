import { describe, it, expect } from 'vitest';
import { isPartnerRole } from '@/lib/auth/roles';

describe('isPartnerRole', () => {
    it('returns true for CorporatePartner', () => {
        expect(isPartnerRole('CorporatePartner')).toBe(true);
    });

    it('returns true for NGO', () => {
        expect(isPartnerRole('NGO')).toBe(true);
    });

    it('returns false for other valid roles', () => {
        expect(isPartnerRole('Mentee')).toBe(false);
        expect(isPartnerRole('Mentor')).toBe(false);
        expect(isPartnerRole('Moderator')).toBe(false);
        expect(isPartnerRole('SuperAdmin')).toBe(false);
    });

    it('returns false for invalid or unknown roles', () => {
        expect(isPartnerRole('SomeRandomRole')).toBe(false);
        expect(isPartnerRole('')).toBe(false);
    });

    it('returns false for null or undefined', () => {
        expect(isPartnerRole(null)).toBe(false);
        expect(isPartnerRole(undefined)).toBe(false);
    });
});
