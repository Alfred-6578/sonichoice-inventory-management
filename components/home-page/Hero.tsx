'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import MetricCard from "./dashboard-preview/MetricCard";
import MiniRow from "../ui/MiniRow";
import TrustItem from "../ui/TrustItem";
import SidebarItem from "../ui/SidebarItem";
import Button from "../ui/Button";
import { DM_Mono, Syne } from "next/font/google";
import { BiSolidShield } from "react-icons/bi";
import { HiCheck } from "react-icons/hi";
import { FaLocationPin, FaMapLocation } from "react-icons/fa6";
import DashboardPreview from "./dashboard-preview/DashboardPreview";



const syne = Syne({ 
    variable: "--font-syne",
    subsets: ["latin"],
});

const dm_mono = DM_Mono({
    variable: "--font-dm-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
})

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current ${className}`}>
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current ${className}`}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);

const Hero = () => {
  const router = useRouter();

  return (
    <section className=" w-full pb-18 tny:pb-24 overflow-x-hidden pt-40">

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber/20 blur-[140px] rounded-full pointer-events-none" />

      <div className=" flex flex-col text-center items-center gap-16">

        
        <div className="flex flex-col items-center">

          {/* Eyebrow */}
          <div className={`flex items-center px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber gap-2 text-[13px] mb-4 uppercase ${dm_mono.className}`}>
            <span className="w-2 h-2 bg-amber rounded-full"></span>
            Delivery Operations Platform
          </div>

          {/* Heading */}
          <h1 className={`text-3xl tny:text-4xl vsm:text-[40px] sm:text-5xl font-extrabold leading-tight text-white mb-6 ${syne.className}`}>
            Every parcel. <em className="not-italic text-amber">Every branch.</em>
            <br />
          <span className="text-ink-muted text-2xl tny:text-3xl vsm:text-4xl sm:text-[42px] font-bold">Always accounted for.</span>

          </h1>


          {/* Subtitle */}
          <p className=" vsm:text-lg text-border/70 mb-8 max-w-2xl">
            Sonichoice gives your delivery company a single system to track
            parcels from <strong>drop-off to doorstep</strong> — across every
            branch, every route, in real time.
          </p>

          {/* Buttons */}
          <div className="flex max-vsm:flex-col max-vsm:w-full gap-4 mb-8">
            <Button
              onClick={() => router.push('/login')}
              variant="hero"
              size="md"
              className="gap-2"
              rightIcon={ArrowRightIcon}
            >
              Start tracking
            </Button>

            <Button
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              variant="ghost"
              size="md"
              className="gap-2"
              leftIcon={PlayIcon}
            >
              See how it works
            </Button>
           
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-4 vsm:gap-6 text-sm text-ink-muted">

            <TrustItem Icon={BiSolidShield} text="Role-based access" />

            <span className="w-px h-4 bg-border"></span>

            <TrustItem Icon={FaMapLocation} text="Multi-branch support" />

            <span className="w-px h-4 bg-border"></span>

            <TrustItem Icon={HiCheck} text="Real-time tracking" />

          </div>
        </div>

        <DashboardPreview />

      </div>
    </section>
  );
}



export default Hero