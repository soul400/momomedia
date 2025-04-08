import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Footer } from "@/components/layout/footer";
import { MediaCard } from "@/components/media-card";
import { SupporterCard } from "@/components/supporter-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Media, Supporter } from "@shared/schema";
import { Link } from "wouter";
import { ChevronLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [currentYear, currentMonth] = getCurrentYearMonth();
  
  // Fetch featured media
  const { 
    data: featuredMedia, 
    isLoading: isLoadingFeatured 
  } = useQuery<Media[]>({
    queryKey: ["/api/media/featured"],
  });
  
  // Fetch monthly media
  const { 
    data: monthlyMedia, 
    isLoading: isLoadingMonthly 
  } = useQuery<Media[]>({
    queryKey: [`/api/media/year/${currentYear}/month/${currentMonth}`],
  });
  
  // Fetch top supporters
  const { 
    data: topSupporters, 
    isLoading: isLoadingSupporters 
  } = useQuery<Supporter[]>({
    queryKey: [`/api/supporters/top?year=${currentYear}&month=${currentMonth}&limit=6`],
  });
  
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
            {/* Hero Section */}
            <HeroSection />
            
            {/* Featured Content Section */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">أبرز تصاميم المهره</h2>
                <Link href="/featured">
                  <a className="text-primary hover:text-primary/80 text-sm flex items-center">
                    عرض الكل
                    <ChevronLeft className="mr-1 h-4 w-4" />
                  </a>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {isLoadingFeatured ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, i) => <FeaturedSkeleton key={i} />)
                ) : featuredMedia && featuredMedia.length > 0 ? (
                  // Render featured media
                  featuredMedia.map(media => (
                    <MediaCard 
                      key={media.id} 
                      media={media} 
                      featured={true}
                    />
                  ))
                ) : (
                  // No featured media
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">لا يوجد محتوى مميز</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Recent Content Section by Month */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">
                  محتوى شهر {getMonthName(currentMonth)} {currentYear}
                </h2>
                <div className="flex items-center">
                  <MonthYearSelect />
                  <Link href={`/archive/${currentYear}/${currentMonth}`}>
                    <a className="text-primary hover:text-primary/80 text-sm flex items-center mr-4">
                      عرض الكل
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoadingMonthly ? (
                  // Loading skeletons
                  Array(3).fill(0).map((_, i) => <MonthlySkeleton key={i} />)
                ) : monthlyMedia && monthlyMedia.length > 0 ? (
                  // Render monthly media
                  monthlyMedia.slice(0, 3).map(media => (
                    <MediaCard 
                      key={media.id} 
                      media={media}
                    />
                  ))
                ) : (
                  // No monthly media
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">لا يوجد محتوى لهذا الشهر</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Top Supporters Section */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">داعمين مصممة المهره للشهر الحالي</h2>
                <Link href="/supporters">
                  <a className="text-primary hover:text-primary/80 text-sm flex items-center">
                    عرض الكل
                    <ChevronLeft className="mr-1 h-4 w-4" />
                  </a>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {isLoadingSupporters ? (
                  // Loading skeletons
                  Array(6).fill(0).map((_, i) => <SupporterSkeleton key={i} />)
                ) : topSupporters && topSupporters.length > 0 ? (
                  // Render supporters
                  topSupporters.map(supporter => (
                    <SupporterCard 
                      key={supporter.id} 
                      supporter={supporter}
                    />
                  ))
                ) : (
                  // No supporters
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">لا يوجد داعمين لهذا الشهر</p>
                  </div>
                )}
              </div>
            </section>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="mb-10">
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1561736778-92e52a7769ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="بث مباشر" 
          className="w-full h-64 md:h-96 object-cover"
        />
        
        <div className="absolute bottom-0 right-0 p-6 z-20">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-2">
            بثوث المهره
          </h2>
          <p className="text-gray-200 mb-4">أرشيف تصاميم ولحظات بث مصممة المهره الإبداعية</p>
          <div className="flex space-x-3 space-x-reverse">
            <Button>
              <Play className="ml-2 h-4 w-4" />
              أحدث المقاطع
            </Button>
            <Button variant="outline" className="border-gray-600 bg-black/50 hover:bg-black/70">
              استكشف المزيد
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MonthYearSelect() {
  const [currentYear, currentMonth] = getCurrentYearMonth();
  const [selectedValue, setSelectedValue] = useState(`${currentYear}-${currentMonth}`);
  
  return (
    <div className="relative hidden md:block min-w-[150px]">
      <Select defaultValue={selectedValue} onValueChange={(value) => setSelectedValue(value)}>
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

// Helper function to get current year and month
function getCurrentYearMonth(): [number, number] {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1];
}

// Helper function to get Arabic month name
function getMonthName(month: number): string {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  return months[month - 1];
}

// Skeleton loaders
function FeaturedSkeleton() {
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

function MonthlySkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

function SupporterSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 text-center">
      <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
      <Skeleton className="h-5 w-2/3 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto mb-3" />
      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
    </div>
  );
}
