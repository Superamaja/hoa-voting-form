import type { WriteIn } from "../hooks/useBallot";
import { CheckIcon } from "./ui/Icons";

type WriteInRowProps = {
  index: number;
  writeIn: WriteIn;
  isDisabled: boolean;
  onChange: (index: number, patch: Partial<WriteIn>) => void;
};

/** A checkbox-gated free-text write-in slot. */
export const WriteInRow = ({
  index,
  writeIn,
  isDisabled,
  onChange,
}: WriteInRowProps) => {
  const inputId = `write-in-${index}`;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-200 ${
        writeIn.enabled
          ? "border-brand-400/60 bg-brand-500/15"
          : "border-white/12 border-dashed bg-white/[0.02] hover:border-white/25"
      } ${isDisabled ? "opacity-40" : ""}`}
    >
      <label
        className={`shrink-0 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={writeIn.enabled}
          disabled={isDisabled}
          onChange={(e) => onChange(index, { enabled: e.target.checked })}
          aria-label={`Use write-in slot ${index + 1}`}
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400/70 ${
            writeIn.enabled
              ? "border-brand-400 bg-brand-500 text-white"
              : "border-white/25 text-transparent"
          }`}
          aria-hidden="true"
        >
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
      </label>
      <input
        id={inputId}
        type="text"
        value={writeIn.name}
        disabled={!writeIn.enabled}
        onChange={(e) => onChange(index, { name: e.target.value })}
        placeholder={`Write-in candidate #${index + 1}`}
        aria-label={`Write-in candidate ${index + 1}`}
        className="focus-ring w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-500 disabled:cursor-not-allowed"
      />
    </div>
  );
};
