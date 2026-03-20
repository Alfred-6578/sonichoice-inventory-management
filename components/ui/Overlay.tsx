"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
};

export default function Overlay({ isOpen, onClose, zIndex = 50 }: Props) {
  return (
    <div
      onClick={onClose}
      className={`
        fixed inset-0 bg-ink/40 backdrop-blur-sm
        transition-opacity duration-200
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      style={{ zIndex }}
    />
  );
}