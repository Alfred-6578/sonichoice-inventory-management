"use client";

import { useState } from "react";
import { DM_Mono } from "next/font/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

type ComponentSize = "sm" | "md" | "lg";

interface InputProps {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: ComponentSize;
  required?: boolean;
}

const sizeConfig: Record<ComponentSize, { label: string; field: string }> = {
  sm: { label: "text-xs", field: "text-xs py-2" },
  md: { label: "text-sm", field: "text-sm py-3" },
  lg: { label: "text-base", field: "text-base py-4" },
};

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  Icon,
  className,
  size = "md",
  required,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const mappedSize: ComponentSize = size;
  const labelSizeClass = sizeConfig[mappedSize].label;
  const fieldSizeClass = sizeConfig[mappedSize].field;

  return (
    <div className="w-full">
      {label && (
        <label
          className={`${dm_mono.className} text-ink-muted/80 uppercase ${labelSizeClass}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg">

        {Icon && (
          <Icon className="absolute left-3 pr-10 top-[35%] text-xl text-ink-muted/80" />
        )}

        <input
          className={`w-full rounded-lg px-4 ${
            isPassword ? "pr-10" : ""
          } text-ink-muted bg-white border border-border mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent placeholder:text-ink-muted/70 ${fieldSizeClass} ${className}`}
          type={inputType}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[35%] text-lg text-ink-muted/70 hover:text-ink-muted"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}

      </div>
    </div>
  );
}