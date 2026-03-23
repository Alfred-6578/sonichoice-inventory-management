import { BranchDetails } from "@/types/branch";
import BranchCard from "./BranchCard";

interface Props {
  branches: BranchDetails[];
  selectedId?: string | null;
  onSelect?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function BranchGrid({ branches, onSelect, selectedId }: Props) {
  return (
    <div className="flex-1 overflow-y-auto py-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tny:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-[14px]">
        {branches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} onSelect={onSelect} selectedId={selectedId}/>
        ))}
      </div>
    </div>
  );
}