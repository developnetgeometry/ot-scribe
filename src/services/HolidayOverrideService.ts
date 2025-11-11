/**
 * Holiday Override Service
 *
 * Service layer for managing manual holiday overrides and merging them with scraped holidays.
 * Implements precedence logic where overrides supersede scraped holidays.
 *
 * @example
 * ```typescript
 * const service = new HolidayOverrideService();
 *
 * // Create override
 * await service.createOverride({
 *   date: '2025-03-15',
 *   name: 'Company Founder Day',
 *   type: 'company',
 *   description: 'Annual company celebration'
 * });
 *
 * // Get merged holidays (scraped + overrides)
 * const holidays = await service.getMergedHolidays('selangor', 2025);
 * ```
 */

import { supabase } from '@/integrations/supabase/client';
import type { MalaysianStateKey } from '@/config/malaysia-states';
import type {
  HolidayOverride,
  HolidayOverrideInput,
  HolidayOverrideUpdateInput,
  HolidayOverrideResponse,
  MergedHoliday,
  BulkImportResult,
  HolidayImportRow
} from '@/types/holiday-overrides';
import type { MalaysianHoliday } from '@/types/holidays';
import { HolidayConfigService } from './HolidayConfigService';
import { holidayNotificationService } from './HolidayNotificationService';

export class HolidayOverrideService {
  private configService: HolidayConfigService;

  constructor() {
    this.configService = new HolidayConfigService();
  }

  /**
   * Create a new holiday override
   *
   * @param input - Holiday override data
   * @returns Response with created override
   * @throws Error if creation fails or user is not authenticated
   *
   * @example
   * ```typescript
   * const result = await service.createOverride({
   *   date: '2025-03-15',
   *   name: 'Company Founder Day',
   *   type: 'company'
   * });
   * ```
   */
  async createOverride(input: HolidayOverrideInput): Promise<HolidayOverrideResponse> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: 'User must be authenticated to create holiday overrides'
        };
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input.date)) {
        return {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD format'
        };
      }

      // Validate date is valid
      const dateObj = new Date(input.date);
      if (isNaN(dateObj.getTime())) {
        return {
          success: false,
          error: 'Invalid date value'
        };
      }

      // Insert override
      const { data, error } = await supabase
        .from('holiday_overrides')
        .insert({
          company_id: user.id,
          created_by: user.id,
          date: input.date,
          name: input.name.trim(),
          type: input.type,
          description: input.description?.trim() || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating holiday override:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
          return {
            success: false,
            error: 'A holiday override already exists for this date'
          };
        }

        return {
          success: false,
          error: `Failed to create holiday override: ${error.message}`
        };
      }

      const createdOverride = data as HolidayOverride;

      // Send immediate notification for emergency holidays
      if (createdOverride.type === 'emergency') {
        // Fire and forget - don't wait for notification to complete
        holidayNotificationService
          .sendEmergencyHolidayNotification(createdOverride)
          .catch((err) => console.error('Failed to send emergency notification:', err));
      }

      return {
        success: true,
        data: createdOverride
      };
    } catch (error) {
      console.error('Unexpected error creating holiday override:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all holiday overrides for the current company
   *
   * @param year - Optional year filter
   * @returns Array of holiday overrides
   *
   * @example
   * ```typescript
   * const overrides = await service.getOverrides(2025);
   * ```
   */
  async getOverrides(year?: number): Promise<HolidayOverride[]> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('User not authenticated, cannot fetch overrides');
        return [];
      }

      let query = supabase
        .from('holiday_overrides')
        .select('*')
        .eq('company_id', user.id)
        .order('date', { ascending: true });

      // Filter by year if provided
      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching holiday overrides:', error);
        return [];
      }

      return (data as HolidayOverride[]) || [];
    } catch (error) {
      console.error('Unexpected error fetching overrides:', error);
      return [];
    }
  }

  /**
   * Get a specific holiday override by ID
   *
   * @param id - Override ID
   * @returns Holiday override or null
   *
   * @example
   * ```typescript
   * const override = await service.getOverride('uuid-here');
   * ```
   */
  async getOverride(id: string): Promise<HolidayOverride | null> {
    try {
      const { data, error } = await supabase
        .from('holiday_overrides')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching holiday override:', error);
        return null;
      }

      return data as HolidayOverride | null;
    } catch (error) {
      console.error('Unexpected error fetching override:', error);
      return null;
    }
  }

  /**
   * Update an existing holiday override
   *
   * @param id - Override ID
   * @param input - Update data
   * @returns Response with updated override
   *
   * @example
   * ```typescript
   * await service.updateOverride('uuid-here', { name: 'Updated Name' });
   * ```
   */
  async updateOverride(
    id: string,
    input: HolidayOverrideUpdateInput
  ): Promise<HolidayOverrideResponse> {
    try {
      // Build update object with only provided fields
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.type !== undefined) updateData.type = input.type;
      if (input.description !== undefined) updateData.description = input.description?.trim() || null;

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          error: 'No update fields provided'
        };
      }

      const { data, error } = await supabase
        .from('holiday_overrides')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating holiday override:', error);
        return {
          success: false,
          error: `Failed to update holiday override: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as HolidayOverride
      };
    } catch (error) {
      console.error('Unexpected error updating holiday override:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a holiday override
   *
   * @param id - Override ID
   * @returns True if deletion was successful
   *
   * @example
   * ```typescript
   * await service.deleteOverride('uuid-here');
   * ```
   */
  async deleteOverride(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('holiday_overrides')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting holiday override:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting override:', error);
      return false;
    }
  }

  /**
   * Get merged holidays (scraped + overrides) with override precedence
   *
   * This method:
   * 1. Fetches scraped holidays for the state and year
   * 2. Fetches company overrides for the year
   * 3. Merges them with overrides taking precedence
   * 4. Returns sorted by date
   *
   * @param stateKey - Malaysian state key
   * @param year - Year to fetch (defaults to current year)
   * @returns Array of merged holidays
   *
   * @example
   * ```typescript
   * const holidays = await service.getMergedHolidays('selangor', 2025);
   * ```
   */
  async getMergedHolidays(
    stateKey: MalaysianStateKey,
    year?: number
  ): Promise<MergedHoliday[]> {
    const targetYear = year || new Date().getFullYear();

    try {
      // Fetch scraped holidays
      const scrapedHolidays = await this.configService.getHolidaysForState(stateKey, targetYear);

      // Fetch company overrides
      const overrides = await this.getOverrides(targetYear);

      // Merge with override precedence
      return this.mergeWithOverrides(scrapedHolidays, overrides);
    } catch (error) {
      console.error('Error getting merged holidays:', error);
      return [];
    }
  }

  /**
   * Merge scraped holidays with overrides, giving precedence to overrides
   *
   * @private
   * @param scraped - Scraped holidays from database
   * @param overrides - Manual overrides
   * @returns Merged and sorted holidays
   */
  private mergeWithOverrides(
    scraped: MalaysianHoliday[],
    overrides: HolidayOverride[]
  ): MergedHoliday[] {
    // Create a map of override dates for quick lookup
    const overrideMap = new Map<string, HolidayOverride>();
    overrides.forEach(override => {
      overrideMap.set(override.date, override);
    });

    // Filter out scraped holidays that have overrides (overrides take precedence)
    const filteredScraped = scraped
      .filter(holiday => !overrideMap.has(holiday.date))
      .map(holiday => ({
        id: holiday.id,
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        source: 'scraped' as const,
        state: holiday.state,
        created_at: holiday.created_at,
        updated_at: holiday.updated_at
      }));

    // Convert overrides to merged format
    const mergedOverrides: MergedHoliday[] = overrides.map(override => ({
      id: override.id,
      date: override.date,
      name: override.name,
      type: override.type,
      source: 'override' as const,
      description: override.description,
      created_at: override.created_at,
      updated_at: override.updated_at
    }));

    // Combine and sort by date
    const merged = [...filteredScraped, ...mergedOverrides];
    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return merged;
  }

  /**
   * Bulk import holidays from CSV data
   *
   * @param rows - Array of holiday import rows
   * @returns Import result with success/failure counts
   *
   * @example
   * ```typescript
   * const result = await service.bulkImportOverrides([
   *   { date: '2025-03-15', name: 'Company Day', type: 'company' },
   *   { date: '2025-06-20', name: 'Retreat', type: 'company' }
   * ]);
   * ```
   */
  async bulkImportOverrides(rows: HolidayImportRow[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      successful: 0,
      failed: 0,
      errors: [],
      imported: []
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      try {
        const response = await this.createOverride({
          date: row.date,
          name: row.name,
          type: row.type,
          description: row.description
        });

        if (response.success && response.data) {
          result.successful++;
          result.imported.push(response.data);
        } else {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            date: row.date,
            name: row.name,
            error: response.error || 'Unknown error'
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          date: row.date,
          name: row.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Check if a holiday override exists for a specific date
   *
   * @param date - Date to check (YYYY-MM-DD)
   * @returns True if override exists
   *
   * @example
   * ```typescript
   * const exists = await service.hasOverrideForDate('2025-03-15');
   * ```
   */
  async hasOverrideForDate(date: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return false;
      }

      const { count, error } = await supabase
        .from('holiday_overrides')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.id)
        .eq('date', date);

      if (error) {
        console.error('Error checking override existence:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Unexpected error checking override:', error);
      return false;
    }
  }
}

// Export singleton instance
export const holidayOverrideService = new HolidayOverrideService();
