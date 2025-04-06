
// This is now a barrel file that re-exports everything from the reorganized structure
// to maintain backward compatibility with existing imports

// Re-export all types
export * from '../types';

// Re-export all sample data
export * from '../data';

// Re-export helper functions
export {
  getMemberName,
  getBookTitle,
  extractMemberId,
  extractBookId
} from '../utils/referenceHelpers';
