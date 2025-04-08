import { Supporter } from "@shared/schema";
import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupporterCardProps {
  supporter: Supporter;
  className?: string;
}

export function SupporterCard({ supporter, className }: SupporterCardProps) {
  // Get border color based on rank
  const getBorderColor = (rank: number) => {
    if (rank === 1) return "border-primary";
    if (rank === 2) return "border-secondary";
    if (rank === 3) return "border-accent";
    return "border-border";
  };
  
  return (
    <div className={cn(
      "bg-card rounded-xl p-4 text-center hover-scale",
      className
    )}>
      <div className={cn(
        "w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2",
        getBorderColor(supporter.rank)
      )}>
        <img 
          src={supporter.avatarUrl || `https://i.pravatar.cc/150?u=${supporter.id}`} 
          alt={supporter.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-semibold mb-1">{supporter.name}</h3>
      <p className="text-accent text-sm mb-2">
        {getRankText(supporter.rank)}
      </p>
      <div className="flex justify-center items-center text-xs">
        <span className="bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center">
          <Gem className="h-3 w-3 ml-1" />
          {supporter.supportAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function getRankText(rank: number): string {
  switch (rank) {
    case 1:
      return "الداعم الأول";
    case 2:
      return "الداعم الثاني";
    case 3:
      return "الداعم الثالث";
    case 4:
      return "الداعم الرابع";
    case 5:
      return "الداعم الخامس";
    case 6:
      return "الداعم السادس";
    default:
      return `الداعم رقم ${rank}`;
  }
}
