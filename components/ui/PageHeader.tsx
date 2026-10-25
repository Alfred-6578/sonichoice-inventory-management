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
  onButton3,
  button1,
  button2,
  button3,
  button1Icon,
  button2Icon,
  button3Icon,
  loading = false,
}:{
    headerText?: string,
    subText?: string,
    mainText: string,
    onButton1?: ()=> void,
    onButton2?: ()=> void,
    onButton3?: ()=> void,
    button1?: string,
    button2?: string,
    /** Secondary action rendered between button1 and the primary button2. */
    button3?: string,
    button1Icon?: ReactNode
    button2Icon?: ReactNode
    button3Icon?: ReactNode
    loading?: boolean
}) {

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">

      {/* LEFT */}
      <div className="min-w-0">
        {headerText !== undefined &&
            <div className={`text-xs text-[#9ca3af] mb-1 truncate uppercase ${dm_mono.className}`}>
                {loading ? <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" /> : headerText}
            </div>
        }

        <h1 className={`text-2xl font-bold text-[#111827] truncate ${syne.className}`}>
          {mainText}
        </h1>

        {subText !== undefined &&
            <p className="text-sm text-[#6b7280] mt-1">
                {loading ? <span className="inline-block h-3.5 w-44 bg-gray-200 rounded animate-pulse align-middle" /> : subText}
            </p>
        }
      </div>

      {/* RIGHT ACTIONS
          On a phone these sit on one 44px row rather than stacking full width:
          a secondary action that has an icon collapses to that icon alone, and
          the primary takes the space that is left. Labels return at sm. */}
     { button1 || button2 || button3 ?
        <div className="flex items-center gap-2 shrink-0">

        {button1 && <Button
            size="sm"
            variant="secondary"
            onClick={onButton1}
            ariaLabel={button1}
            className={`max-sm:h-11 ${button1Icon ? "max-sm:w-11 max-sm:px-0 max-sm:shrink-0" : "max-sm:flex-1"}`}
        >
            {button1Icon && button1Icon}
            <span className={button1Icon ? "max-sm:hidden" : ""}>{button1}</span>
        </Button>
        }
        {button3 && <Button
            size="sm"
            variant="secondary"
            onClick={onButton3}
            ariaLabel={button3}
            className={`max-sm:h-11 ${button3Icon ? "max-sm:w-11 max-sm:px-0 max-sm:shrink-0" : "max-sm:flex-1"}`}
        >
            {button3Icon && button3Icon}
            <span className={button3Icon ? "max-sm:hidden" : ""}>{button3}</span>
        </Button>
        }
        {button2 && <Button
            size="sm"
            onClick={onButton2}
            className="max-sm:h-11 max-sm:flex-1"
        >
            {button2Icon ?? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            )}
            <span className="truncate">{button2}</span>
        </Button>
        }

      </div>
      : null
      }
    </div>
  );
}