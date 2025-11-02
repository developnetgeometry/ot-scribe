import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickTips() {
  const tips = [
    '💡 You can submit multiple OT sessions per day — ensure times don\'t overlap.',
    '🕒 Check your OT history regularly for approval updates.',
    '📄 Download approved OT reports at the end of each month.'
  ];

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Quick Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
