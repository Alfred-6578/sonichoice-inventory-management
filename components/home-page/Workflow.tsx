"use client";

import { Mail, Cpu, MapPin, Check } from "lucide-react";
import { DM_Mono, Syne } from "next/font/google";


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300","400","500"],
})

const steps = [
  {
    icon: Mail,
    title: "Client drops off",
    description:
      "Client brings a parcel to any branch. Staff logs it with recipient details, size, and fee.",
  },
  {
    icon: Cpu,
    title: "Parcel moves",
    description:
      "Staff dispatch it to the next branch. Each movement updates the parcel's location and timeline.",
  },
  {
    icon: MapPin,
    title: "Arrives at destination",
    description:
      "When it reaches the delivery branch, staff confirm arrival. Parcel shows as ready for final delivery.",
  },
  {
    icon: Check,
    title: "Delivered",
    description:
      "Handed to the recipient. Marked delivered. Full history recorded. Revenue counted.",
  },
];



const Workflow = () => {
  return (
    <section id="workflow" className="w-full py-14 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto xl:px-6 text-center">

        {/* Subtitle */}
        <p className={`text-amber-400 text-sm tracking-widest mb-3 ${dm_mono.className}`}>
          THE WORKFLOW
        </p>

        {/* Title */}
        <h2 className={`text-[27px] vsm:text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-20 ${syne.className}`}>
          From drop-off to delivered
        </h2>

        {/* Workflow Steps */}
        <div className="relative grid md:grid-cols-4 gap-12">

          {/* connecting line */}
          <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-white/10"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative flex flex-col items-center text-center">

                {/* Icon box */}
                <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-[#1a1f2e] border border-white/10 mb-6 z-10">
                  <Icon className="text-amber-400 w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Workflow;