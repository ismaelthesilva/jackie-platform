"use client";

import React from "react";
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

  if (!siteKey) {
    console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured");
    return (
      <div className="text-red-600 text-sm p-2 border border-red-300 rounded">
        Turnstile configuration error. Please contact support.
      </div>
    );
  }

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        options={{
          theme: "light",
          size: "normal",
        }}
      />
    </div>
  );
}
