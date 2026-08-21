import { describe, it, expect } from 'vitest';
import { isPartnerRole, hasCapability, Role } from '@/lib/auth/roles';

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

describe('hasCapability', () => {
    it('returns true for SuperAdmin regardless of scopes or capability', () => {
        expect(hasCapability('SuperAdmin', [], 'APPROVE_MENTOR_APPLICATION')).toBe(true);
        expect(hasCapability('SuperAdmin', ['all'], 'CREATE_MODERATOR_ACCOUNT')).toBe(true);
        expect(hasCapability('SuperAdmin', ['content'], 'APPROVE_ARTICLE')).toBe(true);
    });

    it('returns false for non-admin/non-moderator roles', () => {
        const roles: Role[] = ['Mentee', 'Mentor', 'CorporatePartner', 'NGO'];
        for (const role of roles) {
            expect(hasCapability(role, ['all'], 'APPROVE_MENTOR_APPLICATION')).toBe(false);
            expect(hasCapability(role, [], 'ACCESS_SHADOW_VIEW')).toBe(false);
        }
    });

    it('returns true for a Moderator with the exact required scope', () => {
        expect(hasCapability('Moderator', ['mentor_applications'], 'APPROVE_MENTOR_APPLICATION')).toBe(true);
        expect(hasCapability('Moderator', ['corporate'], 'VET_CORPORATE_PARTNER')).toBe(true);
        expect(hasCapability('Moderator', ['content'], 'APPROVE_ARTICLE')).toBe(true);
    });

    it('returns true for a Moderator with the "all" scope for moderator-allowed capabilities', () => {
        expect(hasCapability('Moderator', ['all'], 'APPROVE_MENTOR_APPLICATION')).toBe(true);
        expect(hasCapability('Moderator', ['all'], 'VET_CORPORATE_PARTNER')).toBe(true);
        expect(hasCapability('Moderator', ['all'], 'APPROVE_ARTICLE')).toBe(true);
    });

    it('returns false for a Moderator missing the required scope', () => {
        expect(hasCapability('Moderator', ['corporate'], 'APPROVE_MENTOR_APPLICATION')).toBe(false);
        expect(hasCapability('Moderator', ['mentor_applications'], 'APPROVE_ARTICLE')).toBe(false);
        expect(hasCapability('Moderator', [], 'APPROVE_MENTOR_APPLICATION')).toBe(false);
    });

    it('returns false for a Moderator checking a SuperAdmin-only capability', () => {
        // Capabilities with empty array in CAPABILITIES are SuperAdmin-only
        expect(hasCapability('Moderator', ['all'], 'ACCESS_SHADOW_VIEW')).toBe(false);
        expect(hasCapability('Moderator', ['all'], 'CREATE_MODERATOR_ACCOUNT')).toBe(false);
        expect(hasCapability('Moderator', ['mentor_applications', 'corporate', 'content'], 'GENERATE_CORPORATE_INVITE_JWT')).toBe(false);
    });
});

