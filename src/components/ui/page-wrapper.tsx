import { ReactNode } from "react";
import { ErrorBoundary } from "../error-boundary";

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
  children: ReactNode;
  errorFallback?: ReactNode;
}

export function PageWrapper({
  title,
  description,
  className = "",
  children,
  errorFallback,
}: PageHeaderProps) {
  return (
    <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 max-w-20xl">
      <header className={`mb-8 ${className}`}>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-2">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </div>
  );
}
