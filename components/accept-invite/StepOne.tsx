import React from 'react'
import { Syne } from 'next/font/google'
import { BiSolidEnvelope } from 'react-icons/bi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FaArrowRight } from 'react-icons/fa';

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});


interface StepOneProps {
    email: string;
    invitedEmail: string;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const StepOne = ({email, invitedEmail, setEmail, setCurrentStep}: StepOneProps) => {

  const isValid = email === invitedEmail;
  return (
      <div className="">
      
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Invite Verification
        </div>

        <h2 className={` ${syne.className} text-3xl font-bold mt-2  text-ink`}>
          You're invited
        </h2>

        <p className="text-s text-gray-500 mt-2">
          Your admin has sent you an invite to join Sonichoice. Confirm your details
          below to get started.
        </p>

        {/* Invite Card */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6 p-3 sm:p-4 border rounded-xl bg-white">
          
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-ink text-amber">
            <BiSolidEnvelope />
          </div>

          <div className="flex-1">
            <div className="text-xs text-ink-muted/70 font-semibold uppercase">
              Invite sent to
            </div>

            <div className="font-medium text-sm text-ink">
              {invitedEmail}
            </div>

            <div className="text-xs text-ink-muted">
              Invited by Admin · Expires in 48hrs
            </div>
          </div>

          <div className={`max-xsm:hidden flex items-center gap-1 bg-delivered-bg border border-delivered-border rounded-full py-1 px-2 text-green-600 text-xs font-medium`}>
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M9 16.17L4.83 12l-1.42 
              1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Valid
          </div>

        </div>

        {/* Email Field */}
        < div className="mt-8">
          <Input id="email" type='email' placeholder="you@sonichoice.ng" label={"Email Address"} Icon={BiSolidEnvelope} value={email} onChange={(e:any)=>setEmail(e.target.value)}/>
                

          <p className="text-xs text-gray-400 mt-1">
            Must match the email your invite was sent to.
          </p>
        </div>

        {/* Button */}
        <div className="mt-6">
          <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!isValid}
              onClick={() => setCurrentStep(2)}
              rightIcon={FaArrowRight}
          >
              Confirm & Continue
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-500">
          Wrong email?{" "}
          <a href="#" className="underline font-medium text-gray-900">
            Contact your admin
          </a>
        </div>

      </div>
  )
}

export default StepOne