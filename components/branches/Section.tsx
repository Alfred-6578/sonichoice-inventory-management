export default function Section({ title, children, className }: any) {
  return (
    <div className={`p-[16px_18px] border-b border-[0.5px] border-border ${className}`}>
      <div className="text-[9px] font-m text-ink-subtle uppercase tracking-[0.8px] mb-[10px]">
        {title}
      </div>
      {children}
    </div>
  );
}