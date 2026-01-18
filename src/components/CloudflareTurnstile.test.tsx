import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloudflareTurnstile from "./CloudflareTurnstile";

// Mock the @marsidev/react-turnstile component
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess, onError }: any) => (
    <div data-testid="turnstile-widget">
      <button onClick={() => onSuccess("test-token-123")}>Verify</button>
      <button onClick={() => onError?.(new Error("Test error"))}>
        Trigger Error
      </button>
    </div>
  ),
}));

describe("CloudflareTurnstile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
  });

  describe("Rendering", () => {
    it("renders turnstile widget", () => {
      const onSuccess = vi.fn();
      render(<CloudflareTurnstile onSuccess={onSuccess} />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const onSuccess = vi.fn();
      const { container } = render(
        <CloudflareTurnstile onSuccess={onSuccess} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Verification", () => {
    it("calls onSuccess with token on success", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<CloudflareTurnstile onSuccess={onSuccess} />);

      const verifyButton = screen.getByRole("button", { name: /verify/i });
      await user.click(verifyButton);

      expect(onSuccess).toHaveBeenCalledWith("test-token-123");
    });

    it("handles successful verification", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<CloudflareTurnstile onSuccess={onSuccess} />);

      await user.click(screen.getByRole("button", { name: /verify/i }));

      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  describe("Error Handling", () => {
    it("handles missing site key", () => {
      // Suppress expected console.error
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const originalKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

      const onSuccess = vi.fn();
      render(<CloudflareTurnstile onSuccess={onSuccess} />);

      // Check if error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured",
        ),
      );

      // Restore
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalKey;
      consoleErrorSpy.mockRestore();
    });

    it("calls onError when verification fails", async () => {
      // Suppress expected console.error
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const user = userEvent.setup();
      const onError = vi.fn();
      render(<CloudflareTurnstile onSuccess={vi.fn()} onError={onError} />);

      await user.click(screen.getByRole("button", { name: /trigger error/i }));

      expect(onError).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("renders in a container div", () => {
      const onSuccess = vi.fn();
      const { container } = render(
        <CloudflareTurnstile onSuccess={onSuccess} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
