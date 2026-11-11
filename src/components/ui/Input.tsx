import { forwardRef, type InputHTMLAttributes } from 'react';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
  rightIcon?: IconType;
  onClickRightIcon?: () => void;
  rightIconLabel?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, rightIcon: RightIcon, onClickRightIcon, rightIconLabel, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "input transition-all disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-11",
            RightIcon && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onClickRightIcon}
            aria-label={rightIconLabel}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-brand transition-colors"
          >
            <RightIcon size={20} />
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
