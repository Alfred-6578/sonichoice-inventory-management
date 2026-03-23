import AvatarName from "@/components/ui/AvatarName";
import StatusBadge from "@/components/ui/StatusBadge";

type TableRowProps = {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: "transit" | "delivered" | "pending" | string;
};


export default function TableRow({
  id,
  name,
  initials,
  color,
  status,
}: TableRowProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-1 text-slate-300 py-2 overflow-scroll">

      <span className="text-slate-400">{id}</span>

      <AvatarName color={color} initials={initials} name={name} preview={true}/>

      <div className="flex justify-center">
        <StatusBadge status={status} preview={true}/>
      </div>

    </div>
  );
}