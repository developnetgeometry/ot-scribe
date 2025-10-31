import { Smile } from 'lucide-react';

export function FooterNote() {
  return (
    <div className="bg-muted rounded-lg p-6 flex items-center justify-center gap-3 text-center">
      <Smile className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <p className="text-muted-foreground text-sm">
        Welcome back, Supervisor! Keep track of your team's productivity and overtime efficiently.
      </p>
    </div>
  );
}
