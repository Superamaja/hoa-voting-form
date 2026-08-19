import { useRef } from "react";
import type { WriteIn } from "../hooks/useBallot";
import { MAX_WRITE_IN_LENGTH } from "../lib/constants";
import { CheckIcon } from "./ui/Icons";

type WriteInRowProps = {
  index: number;
  writeIn: WriteIn;
  isDisabled: boolean;
  onChange: (index: number, patch: Partial<WriteIn>) => void;
};

/**
 * A free-text write-in slot. Clicking anywhere on the row selects the slot and
 * focuses the field; typing selects it too. The checkbox clears the selection.
 */
export const WriteInRow = ({
  index,
  writeIn,
  isDisabled,
  onChange,
}: WriteInRowProps) => {
  const inputId = `write-in-${index}`;
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Selects the slot when the row is clicked. Reads the pre-click `enabled`
   * value, so a click that unchecks the box does not immediately re-select.
   */
  const handleRowClick = () => {
    if (isDisabled || writeIn.enabled) return;
    onChange(index, { enabled: true });
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-200 ${
        writeIn.enabled
          ? "border-brand-400/60 bg-brand-500/15 shadow-glow"
          : "border-dashed border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.07]"
      } ${isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
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
        ref={inputRef}
        type="text"
        value={writeIn.name}
        disabled={isDisabled}
        onChange={(e) =>
          onChange(index, { enabled: true, name: e.target.value })
        }
        maxLength={MAX_WRITE_IN_LENGTH}
        placeholder={`Write-in candidate #${index + 1}`}
        aria-label={`Write-in candidate ${index + 1}`}
        className="w-full bg-transparent text-sm font-medium text-white focus-ring placeholder:text-slate-500 disabled:cursor-not-allowed"
      />
    </div>
  );
};
