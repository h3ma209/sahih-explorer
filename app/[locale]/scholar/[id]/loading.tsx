import { Skeleton } from "@/components/ui/skeleton";

export default function ScholarLoading() {
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Skeleton */}
      <section className="relative py-20 overflow-hidden bg-background">
        <div className="container px-4 mx-auto relative z-10 text-center">
            <div className="flex justify-center mb-6">
                <Skeleton className="h-10 w-48 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 max-w-lg mx-auto mb-8" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="container px-4 mx-auto space-y-8">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
