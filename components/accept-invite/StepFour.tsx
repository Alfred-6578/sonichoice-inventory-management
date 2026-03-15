"use client";

import { Syne } from "next/font/google";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Button from "../ui/Button";
import { IoSend } from "react-icons/io5";

interface StepFourProps {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  branch: string;
  setCurrentStep: (step: number) => void;
  handleSubmit: () => void;
}

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const StepFour = ({
  email,
  firstName,
  lastName,
  phone,
  branch,
  setCurrentStep,
  handleSubmit,
}: StepFourProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isValid = email && firstName && lastName && phone && branch && acceptedTerms;

  return (
    <div className="mx-auto">

      {/* HEADER */}
      <div className="text-xs uppercase text-gray-500 font-semibold">
        Review
      </div>

      <h2 className={`${syne.className} text-3xl font-bold mt-2  text-ink`}>
        Almost done
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        Review your details before sending your access request to the admin.
      </p>

      {/* REVIEW CARD */}
      <div className="border rounded-xl mt-6 p-4 space-y-5 bg-white">

        {/* INVITE */}
        <div>
          <div className="flex justify-between font-semibold text-xs mb-2">
            <p className="uppercase font-mono text-ink-muted/50">Invite</p>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs underline text-amber"
            >
              Edit
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="text-ink-muted font-bold">{email || "—"}</span>
          </div>
        </div>

        {/* PROFILE */}
        <div>
          <div className="flex justify-between font-semibold text-xs mb-2">
            <p className="uppercase font-mono text-ink-muted/50">Profile</p>
            
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs underline text-amber"
            >
              Edit
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Full name</span>
            <span className="text-ink-muted font-bold">{firstName && lastName ? `${firstName} ${lastName}` : "—"}</span>
          </div>

          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Phone</span>
            <span className="text-ink-muted font-bold">{phone || "—"}</span>
          </div>

          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Branch</span>
            <span className="text-ink-muted font-bold">{branch || "—"}</span>
          </div>
        </div>

        {/* SECURITY */}
        <div>
          <div className="flex justify-between font-semibold text-xs mb-2">
            <p className="uppercase font-mono text-ink-muted/50">Security</p>
            
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs underline text-amber"
            >
              Edit
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Password</span>
            <span className="text-ink-muted/50">••••••••</span>
          </div>
        </div>

      </div>

      {/* TERMS */}
      <label className="flex items-start gap-2 mt-6 text-sm">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1"
        />
        <span className="text-ink-muted">
          I agree to the <a href="#" className="underline">Terms of Use</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>. I understand my
          access is subject to admin approval.
        </span>
      </label>

      {/* BUTTONS */}
      <div className="flex justify-between mt-8 gap-4">

        <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentStep(3)}
            leftIcon={FaArrowLeft}
        >
            Back
        </Button>

        <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!isValid}
            onClick={() => setCurrentStep(200)} // Simulate final submission
            rightIcon={IoSend}
        >
            Request Access
        </Button>

      </div>

    </div>
  );
}

export default StepFour;