import { StatusConfig, StatusKey } from "./StatusPillsContainer";

export default function StatusPill({
  item,
  isActive,
  count,
  onClick,
  getActiveStyles,
}: {
  item: StatusConfig;
  isActive: boolean;
  count: number;
  onClick: (status: StatusKey) => void;
  getActiveStyles: (key: StatusKey) => string;
}) {
  return (
    <button
      key={item.key}
      onClick={() => onClick(item.key)}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border transition-all
        ${
          isActive
            ? getActiveStyles(item.key)
            : "bg-surface-raised text-ink-muted border-border hover:border-border-strong hover:text-ink"
        }
      `}
    >
      {/* Dot */}
      {item.dot && <span className={`w-[5px] h-[5px] rounded-full ${item.dot}`} />}

      {/* Label */}
      {item.label}

      {/* Count */}
      <span>{count}</span>
    </button>
  );
}
