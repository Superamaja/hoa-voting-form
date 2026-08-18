import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow hover:from-brand-300 hover:to-brand-500 active:translate-y-px",
  secondary:
    "border border-white/15 bg-white/5 text-slate-100 hover:border-white/25 hover:bg-white/10",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
};

export const Button = ({
  variant = "primary",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && (
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden="true"
      />
    )}
    {children}
  </button>
);
