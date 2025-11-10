import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveChartProps {
  title: string;
  children: ReactNode;
  mobileAlternative?: ReactNode;
  mobileHeight?: number;
  desktopHeight?: number;
}

export function ResponsiveChart({ 
  title, 
  children, 
  mobileAlternative,
  mobileHeight = 200,
  desktopHeight = 260
}: ResponsiveChartProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile && mobileAlternative ? (
          mobileAlternative
        ) : (
          <div style={{ height: isMobile ? mobileHeight : desktopHeight }}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}