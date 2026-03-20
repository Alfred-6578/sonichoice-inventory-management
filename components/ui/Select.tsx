import { DM_Mono } from "next/font/google";

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

type ComponentSize = "sm" | "md" | "lg";

interface SelectProps {
  label?: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  Icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  className?: string;
  size?: ComponentSize;
}

const sizeConfig: Record<ComponentSize, { label: string; field: string }> = {
  sm: { label: "text-xs", field: "text-xs py-2" },
  md: { label: "text-sm", field: "text-sm py-3" },
  lg: { label: "text-base", field: "text-base py-4" },
};

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  Icon,
  placeholder = "Select an option",
  className = "",
  size = "md",
}: SelectProps) {
  const labelSizeClass = sizeConfig[size].label;
  const fieldSizeClass = sizeConfig[size].field;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={`${dm_mono.className} text-ink-muted/80 uppercase ${labelSizeClass}`}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg">
        {Icon && (
          <Icon className="absolute mx-3 top-[35%] pr-10 text-xl text-ink-muted/80 pointer-events-none" />
        )}

        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-lg px-4 text-ink-muted bg-white border border-border mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent ${fieldSizeClass} ${className}`}
        >
          <option value="">{placeholder}</option>

          {options.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}