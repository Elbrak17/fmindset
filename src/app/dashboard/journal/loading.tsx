/**
 * Loading component for the Journal page
 * Displays a skeleton UI while the page is loading
 */
export default function JournalLoading() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header Skeleton */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-5 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Check-in Form Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
              </div>
              
              {/* Slider Skeletons */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Notes Skeleton */}
              <div className="mt-6">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Button Skeleton */}
              <div className="h-12 w-full bg-gray-200 rounded-xl mt-6 animate-pulse"></div>
            </div>

            {/* Trends Chart Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>

            {/* Recent Entries Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Action Items */}
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded mt-1 animate-pulse"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
