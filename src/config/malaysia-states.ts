/**
 * Malaysian State Configuration
 *
 * Re-exports the existing MALAYSIA_STATES from lib/malaysiaStates
 * and provides additional utility functions for holiday configuration.
 *
 * This module consolidates state management for the holiday system.
 */

import { MALAYSIA_STATES, type MalaysiaStateCode } from '@/lib/malaysiaStates';

// Re-export the existing types and constants
export { MALAYSIA_STATES, type MalaysiaStateCode };

/**
 * Type representing valid Malaysian state codes (aliases for backward compatibility)
 */
export type MalaysianStateKey = MalaysiaStateCode;

/**
 * Get array of all state configurations for UI rendering (excluding ALL)
 *
 * @returns Array of state configurations without the ALL option
 *
 * @example
 * ```typescript
 * const states = getAllStates();
 * // Render in Select component
 * states.map(state => (
 *   <SelectItem key={state.value} value={state.value}>
 *     {state.label}
 *   </SelectItem>
 * ))
 * ```
 */
export function getAllStates() {
  // Filter out 'ALL' for state configuration (company must select specific state)
  return MALAYSIA_STATES.filter(state => state.value !== 'ALL');
}

/**
 * Get all states including the ALL option
 *
 * @returns Complete array of state configurations
 */
export function getAllStatesWithNational() {
  return MALAYSIA_STATES;
}

/**
 * Validate if a given string is a valid Malaysian state code
 *
 * @param code - The state code to validate
 * @returns True if the code is valid
 *
 * @example
 * ```typescript
 * isValidStateKey('SGR'); // true
 * isValidStateKey('INVALID'); // false
 * ```
 */
export function isValidStateKey(code: string): code is MalaysiaStateCode {
  return MALAYSIA_STATES.some(state => state.value === code);
}

/**
 * Get state label by code
 *
 * @param code - The state code
 * @returns State label or null if invalid
 *
 * @example
 * ```typescript
 * const label = getStateLabel('SGR');
 * if (label) {
 *   console.log(label); // "Selangor"
 * }
 * ```
 */
export function getStateLabel(code: string): string | null {
  const state = MALAYSIA_STATES.find(s => s.value === code);
  return state ? state.label : null;
}
