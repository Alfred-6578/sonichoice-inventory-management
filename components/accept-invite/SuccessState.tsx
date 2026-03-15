import { FaArrowRight } from "react-icons/fa";
import Button from "../ui/Button";

export default function SuccessState({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="max-w-lg w-full bg-white border border-border rounded-xl p-6 text-center">

        {/* Icon */}
        <div className="relative flex justify-center mb-4">
          <div className="bg-emerald-100 p-4 rounded-full">
            <svg
              className="w-8 h-8 text-emerald-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 
              2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>

          
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-ink mb-1">
          Request sent!
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-ink-muted mb-6">
          Your access request has been submitted. Your admin will review and
          approve your account — you'll get an email once you're in.
        </p>

        {/* Status Card */}
        <div className="border border-border rounded-lg p-4 space-y-4 text-left">

          <StatusRow
            title="Profile completed"
            sub="Your details have been saved"
            status="done"
          />

          <StatusRow
            title="Password set"
            sub="Your account is secured"
            status="done"
          />

          <StatusRow
            title="Awaiting admin approval"
            sub="You'll receive an email when approved"
            status="pending"
          />

        </div>

        {/* Button */}
        <div className="mt-6">
          <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={onBack}
              rightIcon={FaArrowRight}
          >
              Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  title,
  sub,
  status,
}: {
  title: string;
  sub: string;
  status: "done" | "pending";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-full ${
          status === "done"
            ? "bg-emerald-100 text-emerald-600"
            : "bg-amber/60 text-amber"
        }`}
      >
        {status === "done" ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M9 16.17L4.83 12l-1.42 
            1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 
            10 10 10 10-4.48 10-10S17.52 2 
            12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )}
      </div>

      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-muted">{sub}</div>
      </div>
    </div>
  );
}