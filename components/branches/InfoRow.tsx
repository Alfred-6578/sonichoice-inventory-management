export default function InfoRow({ label, value, mono, className }: any) {
  return (
    <div className={`flex justify-between py-[9px] px-2 border-b border-[0.5px] border-border last:border-b-0 ${className}`}>
      <span className="text-[12px] text-ink-muted">{label}</span>
      <span className={`text-[12px] text-ink font-medium text-right max-w-[180px] truncate ${mono ? "font-m text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}