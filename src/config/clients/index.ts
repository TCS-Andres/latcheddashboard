import { latchedBeginnings } from './latched-beginnings';
export type { ClientConfig } from './types';

// Single-client MVP. When multi-tenant, resolve from auth context.
export const activeClient = latchedBeginnings;
