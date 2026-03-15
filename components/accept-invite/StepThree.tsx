"use client";

import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import Input from "../ui/Input";
import { BiSolidLock } from "react-icons/bi";
import { Syne } from "next/font/google";
import Button from "../ui/Button";

interface Step3Props {
    password: string;
    confirmPassword: string;
    setPassword: (pwd: string) => void;
    setConfirmPassword: (pwd: string) => void;
    setCurrentStep: (step: number) => void;
}

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const StepThree = ({password, confirmPassword, setConfirmPassword, setPassword, setCurrentStep }: Step3Props) => {
  
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // password strength
  const getStrength = (pwd:any) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score;
  };

  const strength = getStrength(password);

  const strengthLabels = ["Too weak", "Weak", "Okay", "Strong", "Very strong"];

  const canContinue = strength >= 2 && passwordsMatch;

  return (
    <div className="mx-auto">

      <div className="text-xs uppercase text-gray-500 font-semibold">
        Security
      </div>

      <h2 className={`text-3xl font-bold mt-2  text-ink ${syne.className}`}>
        Set your password
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        Choose a strong password for your branch account. You'll use this every
        time you sign in.
      </p>

        {/* PASSWORD */}
        <div className="mt-6">

            <Input id="password" type="password" Icon={BiSolidLock} label="PASSWORD" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />


            {/* Strength */}
            {password && (
                <div className="mt-3">

                    <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                        key={n}
                        className={`flex-1 h-[3px] rounded 
                        ${
                            strength >= n
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }
                        ${
                            strength == 1 && n === 1 && 'bg-cancelled/80!'
                        }`}
                        />
                    ))}
                    </div>

                    <div className="text-xs text-gray-500 font-mono">
                    {strengthLabels[strength]}
                    </div>

                </div>
            )}

        </div>

        {/* CONFIRM PASSWORD */}
        <div className="mt-6">

            <Input id="confirm_password" type="password" Icon={BiSolidLock} label="CONFIRM PASSWORD" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            {/* Match indicator */}
            {confirmPassword && (
                <div className="mt-2 text-xs font-mono">

                    {passwordsMatch ? (
                    <div className="flex items-center gap-1 text-green-600">
                        ✔ Passwords match
                    </div>
                    ) : (
                    <div className="flex items-center gap-1 text-red-500">
                        ✖ Passwords don't match
                    </div>
                    )}

                </div>
            )}

        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-8 gap-4">

            <Button
                variant="secondary"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={FaArrowLeft}
            >
                Back
            </Button>
    
            <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!passwordsMatch || strength < 2}
                onClick={() => setCurrentStep(4)}
                rightIcon={FaArrowRight}
            >
                Continue
            </Button>

        </div>

    </div>
  );
}

export default StepThree;