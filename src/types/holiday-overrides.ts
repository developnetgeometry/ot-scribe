/**
 * Holiday Override Types
 *
 * Type definitions for the manual holiday override system.
 * These types support HR administrators in managing company-specific,
 * emergency, and government last-minute holiday changes.
 */

/**
 * Holiday override types classification
 */
export type HolidayOverrideType = 'company' | 'emergency' | 'government';

/**
 * Holiday override record from the database
 */
export interface HolidayOverride {
  /** Unique identifier */
  id: string;
  /** Company/user ID that owns this override */
  company_id: string;
  /** Holiday date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Holiday name */
  name: string;
  /** Override type: company, emergency, or government */
  type: HolidayOverrideType;
  /** Optional additional details about the holiday */
  description?: string;
  /** User ID of the administrator who created this override */
  created_by: string;
  /** Timestamp when the override was created */
  created_at: string;
  /** Timestamp when the override was last updated */
  updated_at: string;
}

/**
 * Input data for creating a holiday override
 */
export interface HolidayOverrideInput {
  /** Holiday date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Holiday name */
  name: string;
  /** Override type: company, emergency, or government */
  type: HolidayOverrideType;
  /** Optional additional details about the holiday */
  description?: string;
}

/**
 * Input data for updating an existing holiday override
 */
export interface HolidayOverrideUpdateInput {
  /** Holiday name (optional) */
  name?: string;
  /** Override type (optional) */
  type?: HolidayOverrideType;
  /** Holiday description (optional) */
  description?: string;
}

/**
 * Response from holiday override operations
 */
export interface HolidayOverrideResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Optional error message */
  error?: string;
  /** Optional result data */
  data?: HolidayOverride;
}

/**
 * Bulk import result for holiday overrides
 */
export interface BulkImportResult {
  /** Number of successfully imported holidays */
  successful: number;
  /** Number of failed imports */
  failed: number;
  /** Detailed error messages for failed imports */
  errors: Array<{
    /** Row number in the import file */
    row: number;
    /** Date of the failed holiday */
    date: string;
    /** Holiday name */
    name: string;
    /** Error message */
    error: string;
  }>;
  /** List of successfully imported holidays */
  imported: HolidayOverride[];
}

/**
 * CSV row format for bulk holiday import
 */
export interface HolidayImportRow {
  /** Holiday date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Holiday name */
  name: string;
  /** Override type: company, emergency, or government */
  type: HolidayOverrideType;
  /** Optional description */
  description?: string;
}

/**
 * Merged holiday that can come from either scraped data or manual overrides
 */
export interface MergedHoliday {
  /** Unique identifier */
  id: string;
  /** Holiday date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Holiday name */
  name: string;
  /** Holiday type (varies based on source) */
  type: string;
  /** Source of the holiday: 'scraped' or 'override' */
  source: 'scraped' | 'override';
  /** Original state (for scraped holidays) or company_id (for overrides) */
  state?: string;
  /** Description (for overrides only) */
  description?: string;
  /** Timestamp when created */
  created_at: string;
  /** Timestamp when last updated */
  updated_at: string;
}
