import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { OTForm } from '@/components/ot/OTForm';
import { useOTSubmit } from '@/hooks/useOTSubmit';

export default function SubmitOT() {
  const navigate = useNavigate();
  const { mutate: submitOT, isPending } = useOTSubmit();

  const handleSubmit = (data: any) => {
    submitOT(data, {
      onSuccess: () => {
        navigate('/ot/history');
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Overtime Request</CardTitle>
            <CardDescription>
              Fill in the details below to submit your overtime claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OTForm onSubmit={handleSubmit} isSubmitting={isPending} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
