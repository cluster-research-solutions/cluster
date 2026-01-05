/**
 * @cluster/core
 *
 * Core types for the Cluster platform
 *
 * For pure W3C types, import from '@cluster/w3c'
 * For provider implementations, import from '@cluster/plugins'
 */

// Re-export W3C types for convenience
export * from '@cluster/w3c';

// Database/API types
export * from './db';

// Research extension types
export * from './research';

// Storage provider interface
export * from './storage';

// Zod schemas
export * from './schemas';
