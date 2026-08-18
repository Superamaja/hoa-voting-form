import { CheckIcon } from "./ui/Icons";

type CandidateOptionProps = {
  candidate: string;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (candidate: string) => void;
};

/** Selectable ballot tile for a listed candidate. */
export const CandidateOption = ({
  candidate,
  isSelected,
  isDisabled,
  onToggle,
}: CandidateOptionProps) => (
  <label
    className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
      isSelected
        ? "border-brand-400/60 bg-brand-500/15 shadow-glow"
        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
    } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
  >
    <input
      type="checkbox"
      className="peer sr-only"
      value={candidate}
      checked={isSelected}
      disabled={isDisabled}
      onChange={() => onToggle(candidate)}
    />
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400/70 ${
        isSelected
          ? "border-brand-400 bg-brand-500 text-white"
          : "border-white/25 bg-transparent text-transparent"
      }`}
      aria-hidden="true"
    >
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
    <span className="text-sm font-medium text-slate-100">{candidate}</span>
  </label>
);
