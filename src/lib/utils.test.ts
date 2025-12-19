import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("Utils", () => {
  describe("cn (classnames utility)", () => {
    it("merges class names correctly", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    it("handles conditional classes", () => {
      const result = cn("base-class", false && "hidden", true && "visible");
      expect(result).toBe("base-class visible");
    });

    it("merges tailwind classes with conflict resolution", () => {
      const result = cn("px-4", "px-2"); // px-2 should win
      expect(result).toContain("px-2");
    });

    it("handles undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });
  });
});
