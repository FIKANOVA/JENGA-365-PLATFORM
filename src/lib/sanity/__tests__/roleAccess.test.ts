import { describe, it, expect } from 'vitest';
import { STUDIO_ALLOWED_SCHEMAS, STUDIO_BLOCKED_ROLES } from '@/lib/sanity/roleAccess';

describe('Role Access Configuration', () => {
  describe('STUDIO_ALLOWED_SCHEMAS', () => {
    it('should map SuperAdmin to undefined (unfiltered)', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.SuperAdmin).toBeUndefined();
    });

    it('should map Moderator to specific schemas', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.Moderator).toEqual([
        'article', 'product', 'resource', 'event', 'eventComment',
        'helpTopic', 'voices', 'video', 'userManual', 'author',
        'speaker', 'siteSettings', 'teamOfficial',
      ]);
    });

    it('should map Mentor to an empty array (no access)', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.Mentor).toEqual([]);
    });

    it('should map Mentee to an empty array (no access)', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.Mentee).toEqual([]);
    });

    it('should map CorporatePartner to specific schemas', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.CorporatePartner).toEqual(['partner', 'voices']);
    });

    it('should map NGO to specific schemas', () => {
      expect(STUDIO_ALLOWED_SCHEMAS.NGO).toEqual(['partner']);
    });
  });

  describe('STUDIO_BLOCKED_ROLES', () => {
    it('should identify blocked roles correctly', () => {
      expect(STUDIO_BLOCKED_ROLES).toEqual(['Mentor', 'Mentee']);
    });
  });
});
