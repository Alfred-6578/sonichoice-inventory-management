'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import { DM_Mono } from 'next/font/google';
import Image from 'next/image';

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SideContent = () => {
  return (
    <div className='flex flex-col justify-center max-lg:hidden w-[48%] bg-ink h-screen px-10 xs:px-15'>
        <div className="flex justify-between">
            <h1 className={`${syne.className} text-amber font-extrabold text-2xl uppercase`}>Sonichoice</h1>
            <div className={`${dm_mono.className} bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-full flex items-center px-2.5 h-6`}>v.101</div>
        </div>
        <div className="flex justify-center">
             <div className="illo-wrap">
                <svg viewBox="0 0 280 270" width="356" height="326" xmlns="http://www.w3.org/2000/svg">
            
                    <ellipse cx="140" cy="256" rx="82" ry="9" fill="rgba(245,158,11,0.06)"/>
            
                
                    <path d="M 140 20 Q 140 40 124 58" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <path d="M 140 20 Q 140 40 156 58" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" strokeLinecap="round"/>

                    <rect x="134" y="14" width="12" height="8" rx="3" fill="#1c2e47" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
                    <rect x="137" y="18" width="6" height="4" rx="2" fill="#f59e0b" opacity="0.7"/>
            
                    <rect x="72" y="56" width="136" height="172" rx="12" fill="#1c2e47" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            
                    <rect x="72" y="56" width="136" height="40" rx="12" fill="#162338"/>
                    <rect x="72" y="84" width="136" height="12" fill="#162338"/>
            
                    <text x="96" y="80" fontFamily="'DM Mono',monospace" fontSize="8" fontWeight="500" fill="#f59e0b" letterSpacing="1.5">SONICHOICE</text>
                    <text x="96" y="90" fontFamily="'DM Mono',monospace" fontSize="6.5" fill="#8892a4" letterSpacing="0.8">STAFF PASS</text>
                    
                    <rect x="192" y="64" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.7"/>
            
                    <circle cx="140" cy="126" r="24" fill="#111827" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                
                    <circle cx="140" cy="118" r="9" fill="#253f6e"/>
                    <ellipse cx="140" cy="136" rx="14" ry="9" fill="#253f6e"/>
            
                    <rect x="154" y="108" width="22" height="11" rx="4" fill="#f59e0b"/>
                    <text x="157.5" y="116.5" fontFamily="'DM Mono',monospace" fontSize="6" fontWeight="500" fill="#111827" letterSpacing="0.5">NEW</text>
            
                
                    <rect x="96" y="158" width="88" height="5" rx="2.5" fill="#374151"/>
                    
                    <rect x="104" y="166" width="72" height="3.5" rx="1.8" fill="#253f6e"/>
            
                    
                    <line x1="88" y1="178" x2="192" y2="178" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
            
                
                    <rect x="88" y="186" width="28" height="2.5" rx="1.2" fill="#253f6e"/>
                    <rect x="122" y="186" width="60" height="2.5" rx="1.2" fill="#374151"/>
                    <rect x="88" y="193" width="28" height="2.5" rx="1.2" fill="#253f6e"/>
                    <rect x="122" y="193" width="48" height="2.5" rx="1.2" fill="#374151"/>
            
                
                    <rect x="88" y="204" width="104" height="16" rx="5" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.2)" strokeWidth="0.8"/>
                    <text x="108" y="215" fontFamily="'DM Mono',monospace" fontSize="7" fill="rgba(245,158,11,0.8)" letterSpacing="0.8">PENDING APPROVAL</text>
            
                    
                
                    <rect x="216" y="78" width="56" height="16" rx="5" fill="rgba(22,163,74,0.1)" stroke="rgba(22,163,74,0.2)" strokeWidth="0.7"/>
                    <circle cx="227" cy="86" r="4" fill="rgba(22,163,74,0.2)"/>
                    <text x="224" y="89.5" fontFamily="'DM Mono',monospace" fontSize="7" fill="#4ade80">✓</text>
                    <rect x="234" y="83" width="30" height="2.5" rx="1.2" fill="rgba(22,163,74,0.4)"/>
                
                    <rect x="216" y="100" width="56" height="16" rx="5" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.2)" strokeWidth="0.7"/>
                    <circle cx="227" cy="108" r="4" fill="rgba(245,158,11,0.2)"/>
                    <circle cx="227" cy="108" r="2" fill="#f59e0b" opacity="0.7"/>
                    <rect x="234" y="105" width="30" height="2.5" rx="1.2" fill="rgba(245,158,11,0.4)"/>
                    
                    <rect x="216" y="122" width="56" height="16" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
                    <circle cx="227" cy="130" r="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
                    <rect x="234" y="127" width="30" height="2.5" rx="1.2" fill="rgba(255,255,255,0.08)"/>
            
                
                    <line x1="208" y1="108" x2="216" y2="108" stroke="rgba(245,158,11,0.2)" strokeWidth="0.8" strokeDasharray="2 2"/>
            
                    
                    <rect x="8" y="90" width="54" height="38" rx="6" fill="#1c2e47" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>
                
                    <path d="M 8 90 L 35 112 L 62 90" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" fill="none"/>
                    
                    <rect x="16" y="115" width="30" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
                    <rect x="16" y="119" width="22" height="2" rx="1" fill="rgba(255,255,255,0.05)"/>
                
                    <circle cx="56" cy="86" r="7" fill="#f59e0b" opacity="0.85"/>
                    <text x="52.5" y="90" fontFamily="'DM Mono',monospace" fontSize="8" fill="#111827" fontWeight="500">→</text>
            
                
                    <line x1="62" y1="109" x2="72" y2="109" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="3 2"/>
                    <circle cx="68" cy="109" r="1.5" fill="#f59e0b" opacity="0.5"/>
            
                </svg>
            </div>
        </div>
        <div className="">
            <h1 className={`${syne.className} font-extrabold text-[42px] leading-12`}>
                Set up your<br/>
                <span className={`text-amber`}>branch account.</span>
            </h1>
            <p className="text-ink-muted text-lg my-4">
                Your admin sent you this invite. Complete your profile to request access to your branch.
            </p>
            <div className="flex flex-col gap-6">
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-xs rounded-lg items-center px-2 py-1`}>
                        01
                    </span>
                    <div className="text-sm">
                        <b className="text-border/80 font-semibold">Verify invite</b>
                        <p className="text-border/80">Confirm your email</p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-xs rounded-lg items-center px-2 py-1`}>
                        02
                    </span>
                    <div className="text-sm">
                        <b className="text-border/80 font-semibold">Your details</b>
                        <p className="text-border/80">Name, phone, branch</p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-xs rounded-lg items-center px-2 py-1`}>
                        03
                    </span>
                    <div className="text-sm">
                        <b className="text-border/80 font-semibold">Set password</b>
                        <p className="text-border/80">Secure your account</p>

                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-xs rounded-lg items-center px-2 py-1`}>
                        04
                    </span>
                    <div className="text-sm">
                        <b className="text-border/80 font-semibold">Review & submit</b>
                        <p className="text-border/80">Request access</p>
                    
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SideContent