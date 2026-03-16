import StatusBadge from "@/components/ui/StatutsBadge";
import MetricCard from "./MetricCard";
import SidebarItem from "./SidebarItem";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import { MdDashboard, MdLocationOn, MdPerson } from "react-icons/md";
import { BiSolidPackage } from "react-icons/bi";

export default function DashboardPreview() {
  return (
    <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 bg-[#0b1220] shadow-2xl">

      {/* Browser Bar */}
      <div className="flex gap-4 items-center justify-center relative py-4 border-b border-slate-800 bg-[#0f172a]">
        <div className="absolute left-4 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>

        <div className="text-slate-400 text-sm bg-slate-800 px-6 py-1 rounded-md">
          app.sonichoice.ng/dashboard
        </div>
      </div>

      <div className="flex">

        {/* Sidebar */}
        <div className="max-xsm:hidden lg:w-60 border-r border-slate-800 py-6 px-2 vsm:px-4 lg:px-6 vsm:py-6 bg-ink-bg">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-black">
              S
            </div>
            <span className="text-white font-semibold max-lg:hidden">SONICHOICE</span>
          </div>

          <div className="space-y-3 text-slate-400">

            <SidebarItem Icon={MdDashboard} active label="Dashboard" />
            <SidebarItem Icon={BiSolidPackage} label="Parcels" badge="9" />
            <SidebarItem Icon={MdLocationOn} label="Branches" />
            <SidebarItem Icon={MdPerson} label="Clients" />

          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-4 py-6 vsm:p-6 md:p-8 space-y-6">

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <MetricCard
              label="IN TRANSIT"
              value="3"
              color="text-amber"
              bg="bg-amber"
              delta="+1 today"
            />

            <MetricCard
              label="DELIVERED"
              value="24"
              color="text-delivered"
              bg="bg-delivered"
              delta="↑ 18%"
            />

            <MetricCard
              label="PENDING"
              value="5"
              color="text-ink-muted"
              bg="bg-ink-muted"
              delta="—"
            />

            <MetricCard
              label="REVENUE"
              value="₦187k"
              color="text-white"
              bg="bg-white"
              delta="↑ 12%"
            />

          </div>

          {/* Table */}
          <div className="space-y-4 text-sm">

            <TableHeader />

            <TableRow
              id="PCL-009"
              name="Kemi Adeyemi"
              initials="KA"
              color="bg-blue-500"
              status="Transit"
              fee="₦6,200"
            />

            <TableRow
              id="PCL-008"
              name="Ngozi Eze"
              initials="NE"
              color="bg-purple-500"
              status="Transit"
              fee="₦7,500"
            />

            <TableRow
              id="PCL-007"
              name="Tunde Bakare"
              initials="TB"
              color="bg-emerald-500"
              status="Pending"
              fee="₦1,800"
            />

            <TableRow
              id="PCL-005"
              name="Kemi Adeyemi"
              initials="KA"
              color="bg-blue-500"
              status="Delivered"
              fee="₦6,200"
            />

          </div>

        </div>
      </div>
    </div>
  );
}



