import { OTForm } from './OTForm';
import { useOTUpdate } from '@/hooks/useOTUpdate';
import { OTRequest } from '@/types/otms';

interface EditOTFormProps {
  request: OTRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

function getReasonCategory(reason: string): 'System maintenance' | 'Project deadline' | 'Unexpected breakdown' | 'Client support' | 'Staff shortage' | 'Other' {
  const presetReasons = [
    'System maintenance',
    'Project deadline',
    'Unexpected breakdown',
    'Client support',
    'Staff shortage',
  ];
  
  return presetReasons.includes(reason) ? reason as any : 'Other';
}

function isOtherReason(reason: string): boolean {
  const presetReasons = [
    'System maintenance',
    'Project deadline',
    'Unexpected breakdown',
    'Client support',
    'Staff shortage',
  ];
  
  return !presetReasons.includes(reason);
}

export function EditOTForm({ request, onSuccess, onCancel }: EditOTFormProps) {
  const { mutate: updateOT, isPending } = useOTUpdate();
  
  // Pre-populate form with existing data
  const defaultValues = {
    ot_date: new Date(request.ot_date),
    start_time: request.start_time,
    end_time: request.end_time,
    reason_dropdown: getReasonCategory(request.reason),
    reason_other: isOtherReason(request.reason) ? request.reason : '',
    attachment_urls: request.attachment_urls || [],
  };
  
  const handleUpdate = (data: any) => {
    updateOT({
      requestId: request.id,
      data: { 
        ...data, 
        employee_id: request.employee_id 
      }
    }, {
      onSuccess
    });
  };
  
  return (
    <OTForm
      onSubmit={handleUpdate}
      isSubmitting={isPending}
      employeeId={request.profiles?.employee_id || ''}
      fullName={request.profiles?.full_name || ''}
      onCancel={onCancel}
      defaultValues={defaultValues}
    />
  );
}
