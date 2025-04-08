import { Link } from "wouter";
import { Twitter, Instagram, Youtube, Twitch } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-primary mb-2">بلوقر ستريمر</h2>
            <p className="text-muted-foreground text-sm">أرشيف اللحظات الممتعة من البث المباشر</p>
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitch"
            >
              <Twitch className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-muted-foreground text-sm">
          جميع الحقوق محفوظة © {new Date().getFullYear()} بلوقر ستريمر
        </div>
      </div>
    </footer>
  );
}
