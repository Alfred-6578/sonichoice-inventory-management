"use client";

import { DM_Mono, Syne } from "next/font/google";
import Button from "./Button";
import { ReactNode } from "react";


const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"]
})

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    subsets: ['latin'],
    weight: ["300","400","500"]
})

export default function PageHeader({
  headerText ,
  mainText,
  subText,
  onButton1,
  onButton2,
  button1,
  button2,
  button1Icon,
  button2Icon
}:{
    headerText?: string,
    subText?: string,
    mainText: string,
    onButton1?: ()=> void,
    onButton2?: ()=> void,
    button1?: string,
    button2?: string,
    button1Icon?: ReactNode
    button2Icon?: ReactNode
}) {
  
  // Better plural handling (UX polish)
  

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      {/* LEFT */}
      <div className="min-w-0">
        {headerText &&
            <div className={`text-xs text-[#9ca3af] mb-1 truncate uppercase ${dm_mono.className}`}>
                {headerText}
            </div>
        }

        <h1 className={`text-2xl font-bold text-[#111827] truncate ${syne.className}`}>
          {mainText}
        </h1>

       {subText && 
            <p className="text-sm text-[#6b7280] mt-1">
                {subText}
            </p>
        }
      </div>

      {/* RIGHT ACTIONS */}
     { button1 || button2 ?
        <div className="flex items-center gap-2">

        {/* MY BRANCH */}

        {button1 && <Button
            size="sm"
            variant="secondary"
            onClick={onButton1}
            className="max-lg:w-full"
        >
            {button1Icon && button1Icon}
            {button1}
        </Button>
        }
        {button2 && <Button
            size="sm"
            onClick={onButton2}
            className="max-lg:w-full"
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            {button2}
        </Button>
        }

      </div>
      : null
      }
    </div>
  );
}