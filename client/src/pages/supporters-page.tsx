import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Footer } from "@/components/layout/footer";
import { SupporterCard } from "@/components/supporter-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Supporter } from "@shared/schema";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupportersPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  
  // Fetch supporters for selected month and year
  const { data: supporters, isLoading } = useQuery<Supporter[]>({
    queryKey: [`/api/supporters/top?year=${year}&month=${month}&limit=50`],
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
            {/* Header with filter */}
            <div className="mb-10">
              <div className="flex flex-wrap justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">الداعمين المميزين</h1>
                <div className="flex items-center space-x-4 space-x-reverse mt-4 lg:mt-0">
                  <MonthYearFilter
                    year={year}
                    month={month}
                    onYearChange={setYear}
                    onMonthChange={setMonth}
                  />
                </div>
              </div>
              
              <Card className="bg-gradient-to-r from-primary/20 to-transparent p-6 border-primary/20">
                <div className="max-w-3xl">
                  <h2 className="text-xl font-semibold mb-2">قائمة الشرف</h2>
                  <p className="text-muted-foreground">
                    نشكر جميع الداعمين على دعمهم المتواصل للمحتوى. هذه القائمة تضم أبرز الداعمين لكل شهر ترتيباً حسب قيمة الدعم.
                  </p>
                </div>
              </Card>
            </div>
            
            {/* Supporters Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(10).fill(0).map((_, i) => (
                  <SupporterSkeleton key={i} />
                ))}
              </div>
            ) : supporters && supporters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {supporters.map((supporter) => (
                  <SupporterCard key={supporter.id} supporter={supporter} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold mb-2">لا يوجد داعمين لهذا الشهر</h3>
                <p className="text-muted-foreground">
                  لا يوجد بيانات للداعمين في {getMonthName(month)} {year}
                </p>
              </div>
            )}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

function MonthYearFilter({ 
  year, 
  month, 
  onYearChange, 
  onMonthChange 
}: { 
  year: number; 
  month: number; 
  onYearChange: (year: number) => void; 
  onMonthChange: (month: number) => void; 
}) {
  const handleYearChange = (value: string) => {
    onYearChange(parseInt(value));
  };

  const handleMonthChange = (value: string) => {
    onMonthChange(parseInt(value));
  };

  return (
    <>
      <div>
        <Select defaultValue={month.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="min-w-[120px]">
            <SelectValue placeholder="الشهر" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {getMonthName(i + 1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select defaultValue={year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="min-w-[120px]">
            <SelectValue placeholder="السنة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
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

function SupporterSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 text-center">
      <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
      <Skeleton className="h-5 w-24 mx-auto mb-2" />
      <Skeleton className="h-4 w-16 mx-auto mb-3" />
      <Skeleton className="h-6 w-20 rounded-full mx-auto" />
    </div>
  );
}
