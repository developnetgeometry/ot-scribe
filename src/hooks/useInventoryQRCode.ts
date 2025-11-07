import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface QRCodeData {
  userId: string;
  employeeId: string;
  fullName: string;
  department: string;
  generatedAt: number;
  expiresAt: number;
  token: string;
}

export function useInventoryQRCode(profile: any) {
  const [qrData, setQrData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate new QR code
  const generateQRCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      const now = Date.now();
      const expires = now + (30 * 60 * 1000); // 30 minutes
      const token = uuidv4();

      const payload: QRCodeData = {
        userId: profile.id,
        employeeId: profile.employee_id,
        fullName: profile.full_name,
        department: profile.department?.name || 'N/A',
        generatedAt: now,
        expiresAt: expires,
        token
      };

      // Save to database
      const { error } = await supabase.from('inventory_access_tokens').insert({
        user_id: profile.id,
        token,
        generated_at: new Date(now).toISOString(),
        expires_at: new Date(expires).toISOString(),
        is_active: true
      });

      if (error) throw error;

      setQrData(JSON.stringify(payload));
      setExpiresAt(expires);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [profile]);

  // Calculate time remaining
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeRemaining(0);
        setQrData(null);
        setExpiresAt(null);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  const isExpired = !qrData || timeRemaining <= 0;

  return {
    qrData,
    expiresAt,
    timeRemaining,
    isExpired,
    isGenerating,
    formatTimeRemaining,
    generateQRCode
  };
}
