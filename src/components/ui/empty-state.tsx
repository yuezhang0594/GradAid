import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  className?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  iconClassName = "text-muted-foreground",
  title,
  description,
  className,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      navigate(actionHref);
    }
  };

  return (
    <Card className={cn("max-w-3xl mx-auto py-8", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center">
        <Icon
          className={cn("h-16 w-16 mb-4", iconClassName)}
        />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 whitespace-normal sm:whitespace-pre-line">
          {description}
        </p>
        {actionLabel && (actionHref || onAction) && (
          <Button onClick={handleAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
}
