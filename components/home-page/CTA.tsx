'use client'
import Link from "next/link";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import { Syne } from "next/font/google";



const syne = Syne({
    variable: "--font-syne",
    subsets: ['latin']
})

export default function CTA() {
    const router = useRouter();
  return (
    <div className="flex py-22 items-center justify-center text-white">

      <div className="max-w-3xl w-full bg-ink-bg rounded-3xl px-5 tny:px-8 py-14 md:p-14 text-center shadow-2xl border border-white/5">

        <p className="text-sm tracking-[0.35em] text-amber-400 mb-6">
          READY TO START?
        </p>

        <h1 className={`text-[25px] vsm:text-3xl md:text-4xl font-extrabold leading-tight mb-6 ${syne.className}`}>
          Get your branches <br /> on the same page
        </h1>

        <p className="text-gray-400 vsm:text-lg max-w-xl mx-auto mb-10">
          Your admin sets up the account, invites your team, and you're tracking
          parcels in minutes — no complex setup, no training needed.
        </p>

        <div className="flex justify-center">
            <Button 
                variant="hero" 
                onClick={()=>router.push('/login')}
                className=" tny:px-8 text-ink!"
            >
                Sign in to Sonichoice
                <span className="text-xl">→</span>

            </Button>
        </div>
        

      </div>
    </div>
  );
}