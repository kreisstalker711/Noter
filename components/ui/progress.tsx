import * as React from "react";
import { clsx } from "clsx";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-secondary border border-border/10",
          className
        )}
        {...props}
      >
        <div
          className={clsx(
            "h-full w-full flex-1 bg-primary transition-all duration-500 ease-out rounded-full",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value || 0))}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
