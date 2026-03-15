"use client";
import { Syne } from "next/font/google";
import { useState } from "react";
import Input from "../ui/Input";
import { BiSolidPhone, BiSolidUser, BiUser } from "react-icons/bi";
import Select from "../ui/Select";
import { HiMapPin } from "react-icons/hi2";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Button from "../ui/Button";

interface StepTwoProps {
  setCurrentStep: (step: number) => void;
  firstname: string;
  lastname: string;
  phone: string;
  branch: string;
  setFirstname: (name: string) => void;
  setLastname: (name: string) => void;
  setPhone: (phone: string) => void;
  setBranch: (branch: string) => void;
}


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});


const StepTwo = ({ setCurrentStep, firstname, lastname, phone, branch, setFirstname, setLastname, setPhone, setBranch }: StepTwoProps) => {

  const isValid = firstname && lastname && phone && branch;

  return (
    <div className="mx-auto">

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Your Details
      </div>

      <h2 className={`${syne.className} text-3xl font-bold mt-2  text-ink leading-tight`}>
        Complete your profile
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        This is how you'll appear in the system and how your admin identifies
        your account.
      </p>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        {/* First name */}
        <Input id="firstname" placeholder="Emeka" label={"First Name"} Icon={BiSolidUser} value={firstname} onChange={(e) => setFirstname(e.target.value)} />

        {/* Last name */}
        <Input id="lastname" placeholder="Okafor" label={"Last Name"} Icon={BiSolidUser} value={lastname} onChange={(e) => setLastname(e.target.value)} />



      </div>

      {/* Phone */}
      <div className="mt-6">
       
        <Input id="phone" label="Phone Number" type="tel" placeholder="0803-000-0000" Icon={BiSolidPhone} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      {/* Branch */}
      <div className="mt-6">
        <Select
            label="Assigned Branch"
            id="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            Icon={HiMapPin}
            placeholder="Select your branch"
            options={[
                { label: "Enugu Head Office", value: "enugu" },
                { label: "Ebonyi Branch", value: "kano" },
                { label: "Nsukka Branch", value: "nsukka" },
            ]}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-8 gap-4">

        <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentStep(1)}
            leftIcon={FaArrowLeft}
        >
            Back
        </Button>

        <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!isValid}
            onClick={() => setCurrentStep(3)}
            rightIcon={FaArrowRight}
        >
            Continue
        </Button>

      </div>
    </div>
  );
}

export default StepTwo;