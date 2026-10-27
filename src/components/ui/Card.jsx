import { cn } from "@/lib/utils";

const Card = ({ className, ...props }) => (
  <div
    className={cn("rounded-[14px] border border-line bg-surface text-fg shadow-hair overflow-hidden", className)}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-bold leading-tight", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-5 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
