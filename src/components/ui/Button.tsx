import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { TbLoader2 } from 'react-icons/tb';
import { cn } from '@/lib/utils';

const variants = {
  primary: "btn-primary",
  outline: "btn-outline",
  accent: "btn-accent",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizes = {
  default: "",
  sm: "btn-sm",
  lg: "min-h-13 px-7 text-[1.05rem]",
  icon: "size-10 min-h-0 p-0",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

// Pill buttons from the Intyoza design (see .btn-* in index.css).
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn("btn", variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <TbLoader2 className="animate-spin" size={18} />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
