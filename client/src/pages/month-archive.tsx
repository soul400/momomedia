import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Footer } from "@/components/layout/footer";
import { MediaCard } from "@/components/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Media } from "@shared/schema";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MonthArchive() {
  const { year, month } = useParams<{ year: string; month: string }>();
  
  // Validate parameters
  const yearNumber = parseInt(year);
  const monthNumber = parseInt(month);
  
  if (
    isNaN(yearNumber) || 
    yearNumber < 2024 || 
    yearNumber > 2026 ||
    isNaN(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return <div className="text-center p-10">تاريخ غير صالح</div>;
  }
  
  // Fetch media for the month
  const { data: monthlyMedia, isLoading } = useQuery<Media[]>({
    queryKey: [`/api/media/year/${yearNumber}/month/${monthNumber}`],
  });
  
  // Get month name
  const monthName = getMonthName(monthNumber);
  
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
            <div className="flex flex-wrap justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">{monthName} {yearNumber}</h1>
                <p className="text-muted-foreground">
                  جميع اللقطات والمقاطع لهذا الشهر
                </p>
              </div>
              
              <MonthYearSelect 
                currentYear={yearNumber} 
                currentMonth={monthNumber} 
              />
            </div>
            
            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array(8).fill(0).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))
              ) : monthlyMedia && monthlyMedia.length > 0 ? (
                // Render media cards
                monthlyMedia.map(media => (
                  <MediaCard key={media.id} media={media} />
                ))
              ) : (
                // No media
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    لا يوجد محتوى لشهر {monthName} {yearNumber}
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

// Month and year selector
function MonthYearSelect({ currentYear, currentMonth }: { currentYear: number; currentMonth: number }) {
  return (
    <div className="min-w-[200px] mt-4 md:mt-0">
      <Select defaultValue={`${currentYear}-${currentMonth}`}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* 2024 months */}
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={`2024-${i+1}`} value={`2024-${i+1}`}>
              {getMonthName(i+1)} 2024
            </SelectItem>
          ))}
          
          {/* 2025 months */}
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={`2025-${i+1}`} value={`2025-${i+1}`}>
              {getMonthName(i+1)} 2025
            </SelectItem>
          ))}
          
          {/* 2026 months */}
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={`2026-${i+1}`} value={`2026-${i+1}`}>
              {getMonthName(i+1)} 2026
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Helper function to get Arabic month name
function getMonthName(month: number): string {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  return months[month - 1];
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
