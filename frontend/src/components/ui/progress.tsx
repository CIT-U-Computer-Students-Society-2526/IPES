import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, max, ...props }, ref) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const numericMax = typeof max === 'number' && max > 0 ? max : 100;
  const percent = Math.min(100, Math.round((numericValue / numericMax) * 100));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      value={numericValue}
      max={numericMax}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "absolute left-0 top-0 h-full transition-all rounded-full",
          indicatorClassName || "bg-primary"
        )}
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
