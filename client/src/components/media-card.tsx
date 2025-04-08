import { Link } from "wouter";
import { Play, Eye, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Media } from "@shared/schema";

interface MediaCardProps {
  media: Media;
  className?: string;
  featured?: boolean;
}

export function MediaCard({ media, className, featured = false }: MediaCardProps) {
  const isVideo = media.mediaType === "video";
  
  // Format duration (e.g., 12:34)
  const formatDuration = (duration: string | null) => {
    if (!duration) return "";
    return duration;
  };
  
  // Format date (e.g., 24 مارس 2024)
  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    
    // Arabic month names
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} ${month} ${year}`;
  };
  
  // Format view count (e.g., 45K)
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${Math.floor(views / 1000000)}M`;
    } else if (views >= 1000) {
      return `${Math.floor(views / 1000)}K`;
    } else {
      return views.toString();
    }
  };
  
  return (
    <Link href={`/media/${media.id}`}>
      <a className={cn(
        "bg-card rounded-xl overflow-hidden shadow-lg hover-scale block",
        featured && "glow",
        className
      )}>
        <div className="relative video-card">
          <img 
            src={media.thumbnailUrl || media.fileUrl} 
            alt={media.title} 
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="play-button w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center">
              {isVideo ? (
                <Play className="text-white h-6 w-6" />
              ) : (
                <ImageIcon className="text-white h-6 w-6" />
              )}
            </div>
          </div>
          {isVideo && media.duration && (
            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(media.duration)}
            </span>
          )}
          {media.mediaType === "image" && (
            <span className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded">
              صورة
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{media.title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {media.description || "بدون وصف"}
          </p>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{formatDate(media.uploadDate)}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 ml-1" />
              {formatViews(media.views)}
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
}
