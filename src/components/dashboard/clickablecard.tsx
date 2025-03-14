import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the CardAction interface
export interface CardAction {
  label: string;
  href: string;
  tooltip: string;
}

interface ClickableCardProps {
  children: React.ReactNode;
  action: CardAction;
  className?: string;
}

export function ClickableCard({ children, action, className }: ClickableCardProps) {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`group transition-all hover:shadow-md cursor-pointer ${className}`}
            onClick={() => navigate(action.href)}
          >
            <div className="relative">
              {children}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{action.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}