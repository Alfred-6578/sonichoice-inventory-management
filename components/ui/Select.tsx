import { DM_Mono } from "next/font/google";

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

interface SelectProps {
  label?: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  Icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  className?: string;
}

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  Icon,
  placeholder = "Select an option",
  className = "",
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={`${dm_mono.className} text-ink-muted/80 text-sm uppercase`}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg">
        {Icon && (
          <Icon className="absolute mx-3 top-[35%] text-xl text-ink-muted/80 pointer-events-none" />
        )}

        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-lg px-4 pl-10 text-ink-muted bg-white border border-border py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent ${className}`}
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