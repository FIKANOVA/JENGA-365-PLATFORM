import '@testing-library/jest-dom';
import { fetch } from 'cross-fetch';
import { vi } from 'vitest';

global.fetch = fetch;
vi.mock('server-only', () => ({}));
