import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export const TextField = ({
  label,
  hint,
  id,
  className = "",
  ...props
}: TextFieldProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block text-xs font-semibold tracking-wider text-slate-400 uppercase"
    >
      {label}
    </label>
    <input
      id={id}
      className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white focus-ring transition placeholder:text-slate-500 hover:border-white/20 focus-visible:border-brand-400/60 ${className}`}
      {...props}
    />
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);
