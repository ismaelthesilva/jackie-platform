"use client";

import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface CloudflareTurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  className?: string;
}

export default function CloudflareTurnstile({
  onSuccess,
  onError,
  className = "",
}: CloudflareTurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [error, setError] = useState<string | null>(null);

  if (!siteKey) {
    console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured");
    return (
      <div className="text-red-600 text-sm p-2 border border-red-300 rounded">
        Turnstile configuration error. Please contact support.
      </div>
    );
  }

  const handleError = (error?: Error | any) => {
    console.error("Turnstile error:", error);
    setError("Verification failed. Please refresh the page and try again.");
    onError?.();
  };

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          setError(null);
          onSuccess(token);
        }}
        onError={handleError}
        onExpire={() => {
          console.warn("Turnstile token expired");
          setError("Verification expired. Please try again.");
        }}
        options={{
          theme: "light",
          size: "normal",
          appearance: "always",
          retry: "auto",
          "retry-interval": 8000,
          "refresh-expired": "auto",
        }}
        scriptOptions={{
          defer: true,
          appendTo: "body",
        }}
      />
      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 border border-red-300 rounded bg-red-50">
          {error}
        </div>
      )}
    </div>
  );
}
