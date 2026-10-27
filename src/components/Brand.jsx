import Image from "next/image";
import { cn } from "@/lib/utils";

/** Intyoza logo in the brand purple of each theme (#6C4AB6 light, #B39DDB dark). */
export function Brand({ className = "h-10 w-auto" }) {
  return (
    <>
      <Image src="/logo.png" width={305} height={127} alt="Intyoza" priority className={cn(className, "dark:hidden")} />
      <Image src="/logo-dark.png" width={305} height={127} alt="Intyoza" priority className={cn(className, "hidden dark:block")} />
    </>
  );
}
