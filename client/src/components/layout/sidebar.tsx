import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Calendar, Home, Medal, Heart, LogIn, User, ChevronDown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedYear, setExpandedYear] = useState<number | null>(2024);
  
  const toggleYearExpansion = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };
  
  const isLinkActive = (path: string) => {
    return location === path;
  };
  
  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ];
  
  return (
    <div className={cn("w-64 bg-card border-l border-border h-screen sticky top-0 overflow-auto", className)}>
      <div className="p-5 border-b border-border">
        <h1 className="text-2xl font-bold font-heading text-primary">بثوث المهره</h1>
        <p className="text-sm text-muted-foreground mt-1">أرشيف تصاميم مصممة المهره</p>
      </div>
      
      <nav className="mt-6 px-3">
        <p className="text-xs text-muted-foreground mb-3 px-3">القائمة الرئيسية</p>
        
        <Link href="/">
          <a className={cn(
            "flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1",
            isLinkActive("/") && "bg-primary bg-opacity-20 text-primary"
          )}>
            <Home className="w-5 h-5 ml-2" />
            <span>الصفحة الرئيسية</span>
          </a>
        </Link>
        
        <Link href="/">
          <a className={cn(
            "flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
          )}>
            <Medal className="w-5 h-5 ml-2" />
            <span>أبرز التصاميم</span>
          </a>
        </Link>
        
        <Link href="/supporters">
          <a className={cn(
            "flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1",
            isLinkActive("/supporters") && "bg-primary bg-opacity-20 text-primary"
          )}>
            <Heart className="w-5 h-5 ml-2" />
            <span>داعمين مصممة المهره</span>
          </a>
        </Link>
        
        {user?.isAdmin && (
          <Link href="/admin">
            <a className={cn(
              "flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1",
              isLinkActive("/admin") && "bg-primary bg-opacity-20 text-primary"
            )}>
              <User className="w-5 h-5 ml-2" />
              <span>لوحة الإدارة</span>
            </a>
          </Link>
        )}
        
        <p className="text-xs text-muted-foreground mt-6 mb-3 px-3">الأرشيف</p>
        
        {years.map((year) => (
          <div key={year} className="mb-2">
            <button 
              className={cn(
                "flex items-center justify-between w-full rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20",
                location.startsWith(`/archive/${year}`) && "bg-primary bg-opacity-10 text-primary"
              )}
              onClick={() => toggleYearExpansion(year)}
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 ml-2" />
                <span>{year}</span>
              </div>
              {expandedYear === year ? (
                <ChevronDown className="text-xs text-muted-foreground w-4 h-4" />
              ) : (
                <ChevronLeft className="text-xs text-muted-foreground w-4 h-4" />
              )}
            </button>
            
            {expandedYear === year && (
              <div className="mr-8 mt-1">
                {months.slice(0, 4).map((month) => (
                  <Link key={month.value} href={`/archive/${year}/${month.value}`}>
                    <a className={cn(
                      "flex items-center rounded-lg px-3 py-1 text-sm text-foreground hover:bg-primary hover:bg-opacity-10 mb-1",
                      isLinkActive(`/archive/${year}/${month.value}`) && "text-primary"
                    )}>
                      {month.label}
                    </a>
                  </Link>
                ))}
                <Link href={`/archive/${year}`}>
                  <a className="flex items-center rounded-lg px-3 py-1 text-sm text-foreground hover:bg-primary hover:bg-opacity-10">
                    <ChevronLeft className="w-4 h-4 ml-1" />
                    <span>عرض الكل</span>
                  </a>
                </Link>
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-8 px-3 mb-3">
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/auth">
              <Button className="w-full">
                <LogIn className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

function LogoutButton() {
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <Button 
      variant="outline" 
      className="w-full" 
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? (
        <span>جاري تسجيل الخروج...</span>
      ) : (
        <>
          <LogIn className="ml-2 h-4 w-4 rotate-180" />
          تسجيل الخروج
        </>
      )}
    </Button>
  );
}
