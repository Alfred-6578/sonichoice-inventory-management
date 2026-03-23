import { Syne } from "next/font/google";


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "hero" ;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    `${syne.className} flex items-center justify-center gap-2 rounded-lg font-bold transition ${className}`;

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-lg",
    lg: "px-6 py-3 text-xl",
  };

  const variants = {
    primary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-border"
      : "bg-ink text-white hover:bg-gray-800 cursor-pointer border border-border",

    secondary:
      "border border-border text-ink-muted/80 hover:bg-gray-50 cursor-pointer",

    outline:
      "border border-ink text-ink hover:bg-ink hover:text-white cursor-pointer",


    danger:
      disabled
        ? "bg-red-200 text-red-400 cursor-not-allowed"
        : "bg-red-600 text-white hover:bg-red-700 cursor-pointer",

    hero:
      disabled
        ? "bg-amber text-white/70 cursor-not-allowed"
        : "bg-amber text-white hover:opacity-90 cursor-pointer",

    ghost:
      "bg-ink-muted/40 border border-border/20 text-border opacity-80 hover:opacity-100 cursor-pointer",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {LeftIcon && <LeftIcon className="text-sm" />}
      {children}
      {RightIcon && <RightIcon className="text-sm" />}
    </button>
  );
}