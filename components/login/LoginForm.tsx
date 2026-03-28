'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import {BiSolidLock, BiSolidEnvelope } from "react-icons/bi";
import { BsArrowRight } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { login } from '@/lib/auth';


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const handleLogin = async () => {
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }

      setError("");
      setLoading(true);

      try {
        const data = await login({ email, password });
        
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Login failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className='flex flex-col justify-center h-full w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Secure Access · sonichoice
        </span>
        <div className="py-20">
            <h1 className={`${syne.className} text-3xl font-bold text-ink mb-1 mt-2`}>Welcome back!</h1>
            <p className="text-ink-muted mb-10 text-s">Please enter your credentials to access your account.</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="">
                <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="you@sonichoice.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    Icon={BiSolidEnvelope}
                />

                <div className="mt-6 mb-2">
                    <Input
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        Icon={BiSolidLock}
                    />
                </div>

                {/* <Link className='text-amber font-bold' href={'/forgot-password'}>Forgot Password?</Link> */}
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                    className="mt-10 py-3.5 text-[22px]"
                    rightIcon={BsArrowRight}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </form>

            <div className="text-center mt-10">
                <p className="text-ink-muted/80 text-sm">
                    Don't have an account? Contact your administrator.
                </p>
            </div>
        </div>
    </div>
  )
}

export default LoginForm