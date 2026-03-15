import { DM_Mono } from 'next/font/google';
import React from 'react'


const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const StepIndicator = ({currentStep}:{currentStep: number}) => {
  return (
    <div className='flex justify-between items-center mb-10'>
        <div className="flex items-center gap-2 mb-2">
            {
                [1,2,3,4].map((_, index)=>(
                    <div className={`w-10 h-1 rounded-lg ${currentStep > index + 1 && "bg-delivered!" } ${index === currentStep - 1   ? "bg-ink-muted" : "bg-gray-200"}`} key={index}>
                        
                    </div>
                ))
            }
                
        </div>
        <div className={`${dm_mono.variable} text-ink-muted/40 text-sm`}>Step {currentStep} of 4</div>
    </div>
  )
}

export default StepIndicator