import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
  title: string;
  description?: string;
  onClick?: () => void;
  badges?: {
    text: string;
    count?: number;
    variant?: "default" | "secondary" | "outline";
    onClick?: () => void;
  }[];
  progress?: {
    value: number;
    label?: string;
  };
  className?: string;
  children?: ReactNode;
}

export function CardWrapper({
  title,
  description,
  onClick,
  badges,
  progress,
  className,
  children,
}: CardWrapperProps) {
  return (
    <Card 
      className={cn(
        "group flex flex-col",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg truncate" title={title}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="truncate" title={description}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    badge.onClick?.();
                  }}
                >
                  <Badge 
                    variant={badge.variant}
                    className={cn(
                      "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                      badge.variant === "default" && "hover:bg-primary/90",
                      badge.variant === "secondary" && "hover:bg-primary/90",
                      badge.variant === "outline" && "hover:bg-primary"
                    )}
                  >
                    {badge.text}
                  </Badge>
                  {badge.count && badge.count > 1 && (
                    <span className="text-xs text-muted-foreground">
                      ({badge.count})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {children}
          {progress && (
            <div className="mt-auto space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.label || "Overall Progress"}
                </span>
                <span>{progress.value}%</span>
              </div>
              <Progress value={progress.value} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
