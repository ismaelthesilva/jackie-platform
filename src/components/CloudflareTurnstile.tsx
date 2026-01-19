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

  const [widgetKey, setWidgetKey] = React.useState(0);

  const handleError = (error?: unknown) => {
    // Safe logging: avoid passing the raw error object to console.error
    // because inspecting it can trigger getters that throw. Build a
    // serialized message first and log only strings.
    try {
      let serialized = "";
      try {
        serialized = JSON.stringify(error);
      } catch (jsonErr) {
        try {
          serialized = String(error);
        } catch (toStrErr) {
          serialized = "Unserializable error object";
        }
      }
      const code =
        error && typeof error === "object" && "code" in (error as any)
          ? (error as any).code
          : undefined;
      const detail =
        error && typeof error === "object" && "detail" in (error as any)
          ? (error as any).detail
          : undefined;
      const msgParts = ["Turnstile error:"];
      if (code !== undefined) msgParts.push(`code=${code}`);
      if (detail !== undefined) msgParts.push(`detail=${detail}`);
      msgParts.push(`payload=${serialized}`);
      console.error(msgParts.join(" "));
    } catch (finalErr) {
      try {
        console.error("Turnstile error: (logging failed)");
      } catch (_) {
        // swallow
      }
    }

    // Safely extract code/detail
    let code: string | number | null = null;
    let detail: string | null = null;
    try {
      if (error && typeof error === "object") {
        const e: any = error as any;
        code = e.code ?? e.error ?? null;
        detail = e.message ?? e.detail ?? null;
      } else if (typeof error === "string") {
        code = error;
      }
    } catch (ex) {
      // ignore extraction errors
    }

    const userMessage = code
      ? `Verification failed (code: ${code}). Please retry.`
      : "Verification failed. Please retry.";

    setError(userMessage + (detail ? ` (${String(detail)})` : ""));
    onError?.();
  };

  const handleRetry = () => {
    setError(null);
    // bump key to force remount the Turnstile widget
    setWidgetKey((k) => k + 1);
  };

  return (
    <div className={className}>
      <Turnstile
        key={widgetKey}
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
        }}
        scriptOptions={{
          defer: true,
          appendTo: "body",
        }}
      />
      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 border border-red-300 rounded bg-red-50">
          <div>{error}</div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-2 py-1 bg-white border rounded text-sm"
              onClick={handleRetry}
            >
              Retry
            </button>
            <button
              className="px-2 py-1 bg-white border rounded text-sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
