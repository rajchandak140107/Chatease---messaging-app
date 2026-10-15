import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  right?: ReactNode;
  labelRight?: ReactNode;
}

export default function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  right,
  labelRight,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {labelRight}
      </div>

      <div className="group flex h-12 items-center rounded-xl border border-line bg-surface shadow-soft transition focus-within:border-brand/60 focus-within:ring-4 focus-within:ring-brand/10">
        <Icon
          size={18}
          className="ml-4 shrink-0 text-muted transition group-focus-within:text-brand"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted/70"
          required
        />
        {right}
      </div>
    </div>
  );
}