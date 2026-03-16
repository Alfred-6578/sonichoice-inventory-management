import { DM_Mono, Syne } from "next/font/google";
import { BiPackage } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { ImLocation2 } from "react-icons/im";
import { MdDashboard } from "react-icons/md";
import { TbArrowsDiff } from "react-icons/tb";


const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"],
})

const dm_mono = DM_Mono({
    variable: "--font-dm-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
})

const Features = () => {
  const features = [
    {
      title: "Parcel tracking",
      desc: "Log every parcel with full details — sender, recipient, size, fee, route. Know exactly where it is at any point in its journey.",
      tag: "CORE FEATURE",
      Icon: BiPackage 
    },
    {
      title: "Branch management",
      desc: "Manage all your branch locations in one place. See which parcels are sitting where and how long they've been there.",
      tag: "OPERATIONS",
      Icon: ImLocation2
    },
    {
      title: "Movement history",
      desc: "Full timeline for every parcel. Every branch it passed through, every status change — all logged and visible to staff and admin.",
      tag: "TRANSPARENCY",
      Icon: TbArrowsDiff
    },
    {
      title: "Client profiles",
      desc: "Keep records of every sender. Track how many parcels each client has sent, their total spend, and all active deliveries.",
      tag: "CRM",
      Icon: FaUsers
    },
    {
      title: "Role-based access",
      desc: "Admins see everything. Staff see only what they need. Admin-only pages don’t even appear in staff navigation.",
      tag: "SECURITY",
      Icon:FaShieldAlt
    },
    {
      title: "Live dashboard",
      desc: "At-a-glance metrics for in-transit, delivered, pending, and revenue. Branch-by-branch breakdown and activity.",
      tag: "ANALYTICS",
      Icon: MdDashboard
    },
  ];

  return (
    <section id="features" className="w-full py-28 xl:px-20">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16">

        <p className={`text-amber-400 text-sm tracking-widest mb-3 ${dm_mono.className}`}>
          WHAT SONICHOICE DOES
        </p>

        <h2 className={`${syne.className} text-[27px] vsm:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight `}>
          Built for how delivery companies actually operate
        </h2>

        <p className="text-slate-400 text-lg mt-6 max-w-2xl">
          Not a generic logistics tool. Sonichoice is designed specifically for
          multi-branch delivery companies that move parcels between locations.
        </p>

      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 border border-slate-800 rounded-2xl overflow-hidden">

        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}

      </div>
    </section>
  );
}


export default Features;


/* ---------------- Feature Card ---------------- */

function FeatureCard({
  title,
  desc,
  tag,
  Icon
}: {
  title: string;
  desc: string;
  tag: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (

    <div className="p-10 hover:bg-ink-muted/10 border-slate-800 border-r border-b last:border-r-0">

      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 mb-6 text-amber-400">
        {Icon ? <Icon className="text-2xl"/> : "●"}
      </div>

      <h3 className="text-white text-xl font-semibold mb-3">
        {title}
      </h3>

      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        {desc}
      </p>

      <span className="text-xs text-amber-400 border border-amber-400/30 px-3 py-1 rounded-md">
        {tag}
      </span>

    </div>
  );
}