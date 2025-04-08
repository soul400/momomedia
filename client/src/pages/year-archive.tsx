import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Footer } from "@/components/layout/footer";
import { MediaCard } from "@/components/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Media } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function YearArchive() {
  const { year } = useParams<{ year: string }>();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
  // Validate year parameter
  const yearNumber = parseInt(year);
  if (isNaN(yearNumber) || yearNumber < 2024 || yearNumber > 2026) {
    return <div className="text-center p-10">سنة غير صالحة</div>;
  }
  
  // Get all media for the year
  const { data: allMedia, isLoading } = useQuery<Media[]>({
    queryKey: [`/api/media/year/${yearNumber}`],
  });
  
  // Filter media by month if selected
  const filteredMedia = allMedia && selectedMonth !== "all"
    ? allMedia.filter(media => media.month === parseInt(selectedMonth))
    : allMedia;
  
  // Group media by month for counts
  const mediaByMonth = allMedia?.reduce((acc, media) => {
    acc[media.month] = (acc[media.month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};
  
  // Arab month names
  const months = [
    { value: 1, name: "يناير" },
    { value: 2, name: "فبراير" },
    { value: 3, name: "مارس" },
    { value: 4, name: "أبريل" },
    { value: 5, name: "مايو" },
    { value: 6, name: "يونيو" },
    { value: 7, name: "يوليو" },
    { value: 8, name: "أغسطس" },
    { value: 9, name: "سبتمبر" },
    { value: 10, name: "أكتوبر" },
    { value: 11, name: "نوفمبر" },
    { value: 12, name: "ديسمبر" },
  ];
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile */}
        <Sidebar className="hidden lg:block" />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Menu */}
          <MobileMenu className="lg:hidden" />
          
          {/* Main Content Area */}
          <main className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">أرشيف {yearNumber}</h1>
              <p className="text-muted-foreground">
                جميع اللقطات والمقاطع على مدار السنة
              </p>
            </div>
            
            {/* Month Filter Tabs */}
            <div className="mb-8">
              <Tabs value={selectedMonth} onValueChange={setSelectedMonth}>
                <TabsList className="mb-4 flex flex-wrap h-auto p-1">
                  <TabsTrigger value="all" className="mb-1">
                    الكل ({allMedia?.length || 0})
                  </TabsTrigger>
                  
                  {months.map((month) => (
                    <TabsTrigger 
                      key={month.value} 
                      value={month.value.toString()}
                      className="mb-1"
                      disabled={!mediaByMonth[month.value]}
                    >
                      {month.name} ({mediaByMonth[month.value] || 0})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array(8).fill(0).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))
              ) : filteredMedia && filteredMedia.length > 0 ? (
                // Render media cards
                filteredMedia.map(media => (
                  <MediaCard key={media.id} media={media} />
                ))
              ) : (
                // No media
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    لا يوجد محتوى في {selectedMonth === "all" ? "هذه السنة" : `شهر ${months.find(m => m.value.toString() === selectedMonth)?.name}`}
                  </p>
                </div>
              )}
            </div>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for media cards
function MediaSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg">
      <Skeleton className="w-full h-44" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
