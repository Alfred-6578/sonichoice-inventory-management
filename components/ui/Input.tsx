"use client";

import { useState } from "react";
import { DM_Mono } from "next/font/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

interface InputProps {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  Icon,
  className,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label
          className={`${dm_mono.className} text-ink-muted/80 text-sm uppercase`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg">

        {Icon && (
          <Icon className="absolute left-3 top-[35%] text-xl text-ink-muted/80" />
        )}

        <input
          className={`w-full rounded-lg px-4 pl-10 ${
            isPassword ? "pr-10" : ""
          } text-ink-muted bg-white border border-border py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent placeholder:text-ink-muted/70 ${className}`}
          type={inputType}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
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