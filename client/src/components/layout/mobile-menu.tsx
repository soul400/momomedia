import { useState } from "react";
import { Link, useLocation } from "wouter";
import { X, Menu, Search, Calendar, Home, Medal, Heart, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };
  
  return (
    <>
      {/* Mobile Header */}
      <header className={cn("bg-card border-b border-border py-4 px-4 sticky top-0 z-10", className)}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-primary">بلوقر ستريمر</h1>
          
          <div className="flex items-center">
            <button 
              onClick={toggleSearch}
              className="p-2 text-muted-foreground hover:text-foreground ml-2"
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <button 
              onClick={toggleMenu}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {isSearchOpen && (
          <div className="mt-3">
            <Input 
              type="text" 
              placeholder="ابحث عن محتوى..." 
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        )}
      </header>
      
      {/* Mobile Navigation Menu (Overlay) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-card h-full w-64 shadow-lg py-4 px-3 overflow-auto">
            <div className="flex justify-between items-center mb-6 px-3">
              <h2 className="text-xl font-bold text-primary">القائمة</h2>
              <button 
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav>
              <Link href="/">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Home className="w-5 h-5 ml-2" />
                  <span>الصفحة الرئيسية</span>
                </a>
              </Link>
              
              <Link href="/">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Medal className="w-5 h-5 ml-2" />
                  <span>أبرز اللحظات</span>
                </a>
              </Link>
              
              <Link href="/supporters">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Heart className="w-5 h-5 ml-2" />
                  <span>الداعمين المميزين</span>
                </a>
              </Link>
              
              {user?.isAdmin && (
                <Link href="/admin">
                  <a 
                    className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                    onClick={closeMenu}
                  >
                    <User className="w-5 h-5 ml-2" />
                    <span>لوحة الإدارة</span>
                  </a>
                </Link>
              )}
              
              <p className="text-xs text-muted-foreground mt-6 mb-3 px-3">الأرشيف</p>
              
              <Link href="/archive/2024">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  <span>2024</span>
                </a>
              </Link>
              
              <Link href="/archive/2025">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  <span>2025</span>
                </a>
              </Link>
              
              <Link href="/archive/2026">
                <a 
                  className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-primary hover:bg-opacity-20 mb-1"
                  onClick={closeMenu}
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  <span>2026</span>
                </a>
              </Link>
              
              <div className="mt-8 px-3">
                {user ? (
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
                ) : (
                  <Link href="/auth">
                    <Button className="w-full" onClick={closeMenu}>
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
