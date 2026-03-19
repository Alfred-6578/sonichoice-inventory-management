export default function SidebarItem({
  label,
  badge,
  active,
  Icon,
  onClick
}: {
  label: string
  badge?: string
  active?: boolean
  Icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) {
  return (
    <div
      className={`flex items-center justify-between px-2 tny:px-3 py-2 rounded-lg cursor-default ${
        active
          ? "bg-slate-800 text-white"
          : "hover:bg-ink-muted/20 cursor-pointer"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className="w-4.5 h-4.5 tny:w-5 tny:h-5 text-slate-400" />
        )}
       <span className="max-lg:hidden">{label}</span>

      </div>


      {badge && (
        <span className="text-xs bg-amber-400 text-black px-2 py-[2px] rounded max-lg:hidden">
          {badge}
        </span>
      )}
    </div>
  );
}