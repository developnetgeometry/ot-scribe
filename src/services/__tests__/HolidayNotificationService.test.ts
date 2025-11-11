/**
 * Tests for HolidayNotificationService
 * Story: 7-3-manual-holiday-override-system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolidayNotificationService } from '../HolidayNotificationService';
import type { HolidayOverride } from '@/types/holiday-overrides';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('HolidayNotificationService', () => {
  let service: HolidayNotificationService;

  beforeEach(() => {
    service = new HolidayNotificationService();
    vi.clearAllMocks();
  });

  describe('sendEmergencyHolidayNotification', () => {
    it('should send notification for emergency holidays', async () => {
      const mockEmployees = [
        { id: 'user-1' },
        { id: 'user-2' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockEmployees,
          error: null,
        }),
      });

      const mockInvoke = vi.fn().mockResolvedValue({ error: null });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.functions.invoke as any) = mockInvoke;

      const holiday: HolidayOverride = {
        id: 'override-1',
        company_id: 'company-1',
        date: '2025-03-15',
        name: 'Emergency Closure',
        type: 'emergency',
        created_by: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      await service.sendEmergencyHolidayNotification(holiday);

      // Should fetch active employees
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSelect().eq).toHaveBeenCalledWith('status', 'active');

      // Should send notification to each employee
      expect(mockInvoke).toHaveBeenCalledTimes(2);
      expect(mockInvoke).toHaveBeenCalledWith(
        'send-push-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            user_id: 'user-1',
            title: '🚨 Emergency Holiday Announcement',
          }),
        })
      );
    });

    it('should not send notification for non-emergency holidays', async () => {
      const mockInvoke = vi.fn();
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any) = mockInvoke;

      const holiday: HolidayOverride = {
        id: 'override-1',
        company_id: 'company-1',
        date: '2025-03-15',
        name: 'Company Day',
        type: 'company',
        created_by: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      await service.sendEmergencyHolidayNotification(holiday);

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should handle error when fetching employees fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const holiday: HolidayOverride = {
        id: 'override-1',
        company_id: 'company-1',
        date: '2025-03-15',
        name: 'Emergency Closure',
        type: 'emergency',
        created_by: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      // Should not throw
      await expect(service.sendEmergencyHolidayNotification(holiday)).resolves.not.toThrow();
    });

    it('should handle empty employee list', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const mockInvoke = vi.fn();

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.functions.invoke as any) = mockInvoke;

      const holiday: HolidayOverride = {
        id: 'override-1',
        company_id: 'company-1',
        date: '2025-03-15',
        name: 'Emergency Closure',
        type: 'emergency',
        created_by: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      await service.sendEmergencyHolidayNotification(holiday);

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('sendDayBeforeReminder', () => {
    it('should send day-before reminder notification', async () => {
      const mockEmployees = [
        { id: 'user-1' },
        { id: 'user-2' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockEmployees,
          error: null,
        }),
      });

      const mockInvoke = vi.fn().mockResolvedValue({ error: null });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.functions.invoke as any) = mockInvoke;

      const holiday = {
        id: 'holiday-1',
        date: '2025-03-15',
        name: 'Company Day',
        type: 'company',
      };

      await service.sendDayBeforeReminder(holiday);

      expect(mockInvoke).toHaveBeenCalledTimes(2);
      expect(mockInvoke).toHaveBeenCalledWith(
        'send-push-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            user_id: 'user-1',
            title: '📅 Holiday Tomorrow: Company Day',
          }),
        })
      );
    });
  });

  describe('scheduleDayBeforeNotifications', () => {
    it('should send notifications for holidays happening tomorrow', async () => {
      const mockEmployees = [{ id: 'user-1' }];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockEmployees,
          error: null,
        }),
      });

      const mockInvoke = vi.fn().mockResolvedValue({ error: null });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      (supabase.functions.invoke as any) = mockInvoke;

      // Create a date for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const holidays = [
        { id: '1', date: '2025-01-01', name: 'Past Holiday', type: 'company' },
        { id: '2', date: tomorrowStr, name: 'Tomorrow Holiday', type: 'company' },
        { id: '3', date: '2025-12-31', name: 'Future Holiday', type: 'company' },
      ];

      await service.scheduleDayBeforeNotifications(holidays);

      // Should only send notification for tomorrow's holiday
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(mockInvoke).toHaveBeenCalledWith(
        'send-push-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            title: '📅 Holiday Tomorrow: Tomorrow Holiday',
          }),
        })
      );
    });

    it('should not send notifications when no holidays tomorrow', async () => {
      const mockInvoke = vi.fn();
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any) = mockInvoke;

      const holidays = [
        { id: '1', date: '2025-01-01', name: 'Past Holiday', type: 'company' },
        { id: '2', date: '2025-12-31', name: 'Future Holiday', type: 'company' },
      ];

      await service.scheduleDayBeforeNotifications(holidays);

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('shouldSendHolidayNotification', () => {
    it('should return true when all_disabled is false', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { all_disabled: false },
            error: null,
          }),
        }),
      });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const shouldSend = await service.shouldSendHolidayNotification('user-1');

      expect(shouldSend).toBe(true);
    });

    it('should return false when all_disabled is true', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { all_disabled: true },
            error: null,
          }),
        }),
      });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const shouldSend = await service.shouldSendHolidayNotification('user-1');

      expect(shouldSend).toBe(false);
    });

    it('should return true when no preferences exist', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const shouldSend = await service.shouldSendHolidayNotification('user-1');

      expect(shouldSend).toBe(true);
    });

    it('should return true on error (fail-safe)', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const shouldSend = await service.shouldSendHolidayNotification('user-1');

      expect(shouldSend).toBe(true);
    });
  });
});
