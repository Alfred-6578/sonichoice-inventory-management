export default function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm border-b border-border pb-1 last:border-none">
      <span className="text-ink-muted">{label}</span>
      <span
        className={`text-ink font-medium capitalize ${
          mono ? "font-mono text-xs" : ""
        } ${highlight ? "text-amber-d" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}