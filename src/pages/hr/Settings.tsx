import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EligibilityRulesTab } from '@/components/hr/settings/EligibilityRulesTab';
import { ThresholdsTab } from '@/components/hr/settings/ThresholdsTab';
import { FormulasTab } from '@/components/hr/settings/FormulasTab';

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Settings</h1>
          <p className="text-muted-foreground">Configure overtime rules and system settings</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="eligibility" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="formulas">Formulas</TabsTrigger>
            </TabsList>

            <TabsContent value="eligibility" className="mt-6">
              <EligibilityRulesTab />
            </TabsContent>

            <TabsContent value="thresholds" className="mt-6">
              <ThresholdsTab />
            </TabsContent>

            <TabsContent value="formulas" className="mt-6">
              <FormulasTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
