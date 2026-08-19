import { AlertIcon, CloseIcon } from "./Icons";

type AlertProps = {
  message: string;
  onDismiss: () => void;
};

export const Alert = ({ message, onDismiss }: AlertProps) => (
  <div
    role="alert"
    className="flex animate-fade-up items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100"
  >
    <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
    <p className="flex-1 leading-relaxed">{message}</p>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss message"
      className="-m-1 rounded-lg p-1 text-rose-200/70 focus-ring transition hover:text-rose-100"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  </div>
);
