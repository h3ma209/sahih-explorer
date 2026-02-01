import { Skeleton } from "@/components/ui/skeleton";

export default function HadithLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="py-12 md:py-24 ">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Title Block */}
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-96 max-w-full" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>

            {/* Matn Card Skeleton */}
            <div className="border rounded-xl bg-card p-6 shadow-sm mb-8">
               <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex gap-2">
                     <Skeleton className="h-8 w-8 rounded-md" />
                     <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
               </div>
               <div className="space-y-4 py-4" dir="rtl">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-[90%]" />
                  <Skeleton className="h-8 w-[95%]" />
                  <Skeleton className="h-8 w-[80%]" />
               </div>
               <div className="mt-6 pt-6 border-t space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[85%]" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Section Skeleton (Sanad) */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
               <Skeleton className="h-12 w-12 rounded-xl" />
               <div className="space-y-2">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-5 w-96" />
               </div>
            </div>

            {/* Narrator List Skeleton */}
            <div className="border rounded-xl bg-card">
               <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32" />
               </div>
               <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                     <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-4 w-full">
                           <Skeleton className="h-8 w-8 rounded-full" />
                           <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-3 w-32" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
