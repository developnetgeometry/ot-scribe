import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EligibilityRulesTab } from '@/components/hr/settings/EligibilityRulesTab';
import { ThresholdsTab } from '@/components/hr/settings/ThresholdsTab';
import { FormulasTab } from '@/components/hr/settings/FormulasTab';
import { HolidaysTab } from '@/components/hr/settings/HolidaysTab';
import { DepartmentsTab } from '@/components/hr/settings/DepartmentsTab';
import { GlobalSettingsTab } from '@/components/hr/settings/GlobalSettingsTab';

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">OT Settings</h1>
          <p className="text-muted-foreground">Configure overtime rules and system settings</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="eligibility" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="formulas">Formulas</TabsTrigger>
              <TabsTrigger value="holidays">Holidays</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="global">Global</TabsTrigger>
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

            <TabsContent value="holidays" className="mt-6">
              <HolidaysTab />
            </TabsContent>

            <TabsContent value="departments" className="mt-6">
              <DepartmentsTab />
            </TabsContent>

            <TabsContent value="global" className="mt-6">
              <GlobalSettingsTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
