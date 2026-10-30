import { cn } from "@/lib/utils";

/** Intyoza logo in the brand purple of each theme (#6C4AB6 light, #B39DDB dark). */
export function Brand({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <>
      <img src="/logo.png" width={305} height={127} alt="Intyoza" className={cn(className, "dark:hidden")} />
      <img src="/logo-dark.png" width={305} height={127} alt="Intyoza" className={cn(className, "hidden dark:block")} />
    </>
  );
}
