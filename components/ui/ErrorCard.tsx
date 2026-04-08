"use client";

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Syne } from "next/font/google";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorCard({ message, onRetry, title }: ErrorCardProps) {
  const isNetwork = /network|connection|fetch|timed out/i.test(message);
  const Icon = isNetwork ? WifiOff : AlertTriangle;

  return (
    <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
      <div className="flex flex-col items-center text-center px-6 py-12">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-red-500" />
        </div>
        <div className={`text-lg font-bold text-ink mb-1 ${syne.className}`}>
          {title || (isNetwork ? "Connection problem" : "Something went wrong")}
        </div>
        <div className="text-sm text-ink-subtle max-w-md mb-5">
          {isNetwork
            ? "We couldn't reach the server. Check your internet connection and try again."
            : message}
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2 bg-ink text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
        {isNetwork && (
          <div className="text-[10px] font-mono text-ink-subtle mt-3">{message}</div>
        )}
      </div>
    </div>
  );
}
