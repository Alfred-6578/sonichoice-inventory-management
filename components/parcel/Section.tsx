export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono text-ink-subtle uppercase mb-2">
        {title}
      </div>
      <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
        {children}
      </div>
    </div>
  );
}