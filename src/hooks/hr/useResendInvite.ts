import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResendInviteData {
  userId: string;
  email: string;
}

export function useResendInvite() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ResendInviteData) => {
      const { data: result, error } = await supabase.functions.invoke('resend-invite', {
        body: { user_id: data.userId, email: data.email },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Activation email sent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
