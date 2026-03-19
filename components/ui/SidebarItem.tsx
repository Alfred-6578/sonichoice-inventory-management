export default function SidebarItem({
  label,
  badge,
  Icon,
}: {
  label: string
  badge?: string
  Icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={`flex items-center w-full justify-between rounded-lg `}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className="w-4.5 h-4.5 tny:w-5 tny:h-5 text-slate-400" />
        )}
       <span className="">{label}</span>

      </div>


      {badge && (
        <span className="text-xs bg-[#fff9eb] text-[#d97706]  px-2 py-[2px] rounded max-lg:hidden">
          {badge}
        </span>
      )}
    </div>
  );
}