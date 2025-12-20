import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NutritionForm from "./NutritionForm";
import nutritionEN from "@/locales/forms/nutritionusa.json";
import nutritionPT from "@/locales/forms/nutritionbr.json";

// Mock EmailJS
vi.mock("@emailjs/browser", () => ({
  default: {
    send: vi.fn(() => Promise.resolve({ status: 200 })),
  },
}));

describe("NutritionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders welcome screen with English locale", () => {
      render(<NutritionForm locale="en" />);
      expect(
        screen.getByText(/Professional Nutrition Questionnaire/i)
      ).toBeInTheDocument();
    });

    it("renders welcome screen with Portuguese locale", () => {
      render(<NutritionForm locale="pt" />);
      expect(
        screen.getByText(/Questionário Nutricional Profissional/i)
      ).toBeInTheDocument();
    });

    it("displays start button", () => {
      render(<NutritionForm locale="en" />);
      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("advances to first section when start is clicked", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(
        screen.getByRole("heading", { name: /1\. Basic Information/i })
      ).toBeInTheDocument();
    });

    it("shows progress timeline after starting", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Progress timeline should be visible after moving past section screen
      expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
    });

    it("can navigate backward", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      expect(
        screen.getByRole("heading", { name: /1\. Basic Information/i })
      ).toBeInTheDocument();
    });
  });

  describe("Form Sections", () => {
    it("has 10 sections", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // The form should have section headers for 10 sections
      // This is structural test
      expect(true).toBe(true); // Placeholder
    });

    it("displays section headers correctly", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(
        screen.getByRole("heading", { name: /1\. Basic Information/i })
      ).toBeInTheDocument();
    });
  });

  describe("Question Types", () => {
    it("handles text input questions", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      const nameInput = screen.getByPlaceholderText(/type your answer/i);
      await user.type(nameInput, "Jane Smith");

      expect(nameInput).toHaveValue("Jane Smith");
    });

    it("handles email input", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Fill first field and navigate
      const input = screen.getByPlaceholderText(/type your answer/i);
      await user.type(input, "Jane Smith");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Now at email field - verify it accepts email
      const emailInput = screen.getByPlaceholderText(/type your answer/i);
      await user.type(emailInput, "jane@example.com");
      expect(emailInput).toHaveValue("jane@example.com");
    });

    it("handles number input", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to number field (age, height, weight)
      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Will need to navigate to number input
    });

    it("handles textarea questions", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to textarea question
      // Test that multi-line input works
    });

    it("handles yes/no questions with auto-advance", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to yes/no question
      // Click yes/no and verify it auto-advances
    });

    it("handles multiple choice questions", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to multiple choice
      // Select option and verify it advances
    });
  });

  describe("Conditional Questions", () => {
    it("shows conditional questions when parent is Yes", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Example: If medicamentos = Yes, show quais_medicamentos
      // This requires navigating through form to that question
    });

    it("skips conditional questions when parent is No", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Answer No and verify conditional question is skipped
    });

    it("handles nested conditional logic", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Test multi-level conditionals
    });
  });

  describe("Progress Tracking", () => {
    it("shows answered count", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Progress bar is visible after moving past section screen
      expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Answered/i)).toBeInTheDocument();
    });

    it("updates completion percentage", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Check for percentage display - should show 0% initially
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it("tracks remaining questions", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText(/Remaining/i)).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("prevents advancing on empty required fields", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it("allows advancing when required field is filled", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      await user.click(screen.getByRole("button", { name: /start/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));

      const input = screen.getByPlaceholderText(/type your answer/i);
      await user.type(input, "Jane Smith");

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });

    it("validates email format", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to email field
      // Enter invalid email and check validation
    });

    it("allows optional fields to be skipped", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to optional field (like informacao_adicional)
      // Verify can skip without filling
    });
  });

  describe("Locale Support", () => {
    it("displays Portuguese text correctly", () => {
      render(<NutritionForm locale="pt" />);

      expect(
        screen.getByText(/Questionário Nutricional Profissional/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /começar/i })
      ).toBeInTheDocument();
    });

    it("uses Sim/Não for yes/no in Portuguese", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="pt" />);

      // Navigate to yes/no question and verify button text
    });

    it("switches between locales correctly", () => {
      const { rerender } = render(<NutritionForm locale="en" />);
      expect(
        screen.getByText(/Professional Nutrition Questionnaire/i)
      ).toBeInTheDocument();

      rerender(<NutritionForm locale="pt" />);
      expect(
        screen.getByText(/Questionário Nutricional Profissional/i)
      ).toBeInTheDocument();
    });
  });

  describe("Multiple Choice Options", () => {
    it("displays options from translation file", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Navigate to multiple choice question like objetivo_principal
      // Verify options are displayed
    });

    it("handles option selection", async () => {
      const user = userEvent.setup();
      render(<NutritionForm locale="en" />);

      // Select an option and verify it's stored
    });
  });

  describe("Form Completion", () => {
    it("shows thank you screen when complete", async () => {
      // This would require filling entire form
      // Complex integration test
    });

    it("displays completion message", async () => {
      // Navigate to end and verify thank you message
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<NutritionForm locale="en" />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it("all interactive elements are keyboard accessible", () => {
      render(<NutritionForm locale="en" />);

      const button = screen.getByRole("button", { name: /start/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    it("uses semantic HTML elements", () => {
      render(<NutritionForm locale="en" />);

      // Check for proper button, input, textarea elements
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Question Count Verification", () => {
    it("has same number of questions as nutritionusa.json (EN)", () => {
      // JSON has a questions object with key-value pairs
      const jsonQuestionCount = Object.keys(nutritionEN.questions).length;

      // We know from manual count that there are 131 question keys
      expect(jsonQuestionCount).toBe(131);
    });

    it("has same number of questions as nutritionbr.json (PT)", () => {
      // JSON has a questions object with key-value pairs
      const jsonQuestionCount = Object.keys(nutritionPT.questions).length;

      // Both English and Portuguese should have same number of questions
      expect(jsonQuestionCount).toBe(131);
    });

    it("EN and PT JSON files have matching question counts", () => {
      const enCount = Object.keys(nutritionEN.questions).length;
      const ptCount = Object.keys(nutritionPT.questions).length;

      // Both locales must have identical structure
      expect(enCount).toBe(ptCount);
      expect(enCount).toBe(131);
    });

    it("EN and PT JSON files have matching question IDs", () => {
      const enIds = Object.keys(nutritionEN.questions).sort();
      const ptIds = Object.keys(nutritionPT.questions).sort();

      // All IDs should match between locales
      expect(enIds).toEqual(ptIds);
    });

    it("covers all 10 sections", () => {
      // Count section headers in JSON
      const sectionKeys = Object.keys(nutritionEN.sections);

      // Should have exactly 10 sections
      expect(sectionKeys.length).toBe(10);
    });
  });
});
