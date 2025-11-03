export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-64 border-r border-border">
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            
            {/* Cards Grid */}
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

            {/* Content Area */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="border border-border rounded-lg p-6">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}