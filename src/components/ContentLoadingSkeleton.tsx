export function ContentLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-lg">
            <div className="space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 border-b border-border last:border-0">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}