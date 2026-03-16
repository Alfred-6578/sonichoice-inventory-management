import { Syne } from "next/font/google";


const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"],
})


const Stats = () => {

  const stats = [
    {
      value: "3",
      label: "Branch locations supported",
      highlight: true,
    },
    {
      value: "100%",
      label: "Parcel visibility, end to end",
      highlight: true,
    },
    {
      value: "2",
      label: "Role levels — Staff & Admin",
      highlight: true,
    },
    {
      value: "0s",
      label: "Time to locate any parcel",
      highlight: false,
    },
  ];

  return (
    <section className="w-full flex justify-center lg:py-10">
      <div className="max-w-7xl w-full rounded-2xl border border-slate-800 bg-ink-bg xl:px-10 py-2 tny:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-700">

          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center px-6 py-6 lg:py-4 flex flex-col items-center"
            >
              <div className={`text-[42px] tny:text-5xl font-extrabold mb-1 tny:mb-3 tracking-tight ${syne.className}`}>
                <span className={i%2 === 0 ? "text-amber":"text-white"}>{stat.value.replace(/[^\d]/g, "")}</span>
                <span className={i%2 === 0 ? "text-white":"text-amber"}>{stat.value.replace(/\d/g, "")}</span>
              </div>

              <p className="text-slate-400 max-w-[180px] leading-snug">
                {stat.label}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default Stats