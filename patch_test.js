const fs = require('fs');
let content = fs.readFileSync('src/__tests__/actions/matching.test.ts', 'utf8');

if (!content.includes('import { synthesizeUserProfile }')) {
  content = content.replace(
    "import { db } from '@/lib/db'",
    "import { db } from '@/lib/db'\nimport { synthesizeUserProfile } from '@/lib/ai/profileSynthesizer'"
  );
}

if (!content.includes('expect(synthesizeUserProfile).not.toHaveBeenCalled()')) {
  content = content.replace(
    "    expect(where).toHaveBeenCalledWith({\n      col: 'users.id',\n      val: userId,\n    })\n  })",
    "    expect(where).toHaveBeenCalledWith({\n      col: 'users.id',\n      val: userId,\n    })\n\n    // Verify synthesizeUserProfile is NOT called in this function\n    expect(synthesizeUserProfile).not.toHaveBeenCalled()\n  })\n"
  );
}

if (!content.includes('afterEach(() => {')) {
  content = content.replace(
    "describe('updateUserProfileAsset', () => {\n  beforeEach(() => {\n    vi.clearAllMocks()\n    vi.useFakeTimers()\n    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'))\n  })",
    "describe('updateUserProfileAsset', () => {\n  beforeEach(() => {\n    vi.clearAllMocks()\n    vi.useFakeTimers()\n    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'))\n  })\n\n  afterEach(() => {\n    vi.useRealTimers()\n  })"
  );
}

fs.writeFileSync('src/__tests__/actions/matching.test.ts', content);
