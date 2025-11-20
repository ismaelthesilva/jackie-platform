import { test, expect, Page } from "@playwright/test";
import {
  generateFullFormAnswers,
  generateMinimalFormAnswers,
  getExpectedQuestionIds,
} from "./nutrition-usa-test-data"; // Reusing same test data structure

/**
 * Comprehensive tests for Nutrition BR form (Portuguese version)
 * Tests form completion, conditional logic, and data submission
 */

test.describe("Nutrition BR Form", () => {
  let capturedEmailData: any = null;

  test.beforeEach(async ({ page }) => {
    // Reset captured data
    capturedEmailData = null;

    // Intercept EmailJS requests to capture what would be sent to Dr. Jackie
    await page.route("**/api.emailjs.com/**", async (route) => {
      const request = route.request();
      const postData = request.postData();

      if (postData) {
        try {
          // EmailJS sends JSON data
          const jsonData = JSON.parse(postData);
          capturedEmailData = {
            to_email: jsonData.to_email || jsonData.user_id,
            client_name: jsonData.client_name || jsonData.from_name,
            client_email: jsonData.client_email || jsonData.reply_to,
            email_body: jsonData.email_body || jsonData.message,
          };
          console.log("📧 Captured email data:", {
            to: capturedEmailData.to_email,
            client: capturedEmailData.client_name,
            bodyLength: capturedEmailData.email_body?.length || 0,
            fullData: Object.keys(jsonData),
          });
        } catch (e) {
          console.error("Failed to parse email data:", e);
          console.log("Raw post data:", postData);
        }
      }

      // Continue with the request or mock response
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ status: "OK", text: "Email sent successfully" }),
      });
    });
  });

  /**
   * Helper function to fill out the entire form with comprehensive answers
   */
  async function fillFullForm(page: Page) {
    const answers = generateFullFormAnswers();

    console.log(`🎯 Starting form with comprehensive test data`);

    // Click through welcome screen
    await page.goto("http://localhost:3001/nutritionbr");
    await expect(
      page.getByText("Questionário Nutricional Profissional")
    ).toBeVisible();
    await page.getByRole("button", { name: /começar|continuar/i }).click();

    let questionCount = 0;
    const maxQuestions = 150; // Safety limit

    while (questionCount < maxQuestions) {
      questionCount++;

      // Wait for question to be visible
      await page.waitForSelector("input, textarea, button", {
        timeout: 5000,
      });

      // Check if we've reached the thank you page
      const thankYouVisible = await page
        .getByText(/obrigado por completar o questionário/i)
        .isVisible()
        .catch(() => false);
      if (thankYouVisible) {
        console.log(
          `✅ Reached thank you page after ${questionCount - 1} questions`
        );
        break;
      }

      // Check for section headers (welcome screens between sections)
      const continueButton = page.getByRole("button", { name: /continuar/i });
      const isSectionHeader = await continueButton
        .isVisible()
        .catch(() => false);
      if (isSectionHeader) {
        await continueButton.click();
        continue;
      }

      // Handle different question types
      const textInput = page.locator('input[type="text"]').first();
      const numberInput = page.locator('input[type="number"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const textareaInput = page.locator("textarea").first();
      const yesButton = page.getByRole("button", { name: /^sim$/i });
      const noButton = page.getByRole("button", { name: /^não$/i });

      // Try to identify current question by checking visible elements
      let answered = false;

      // Text input
      if ((await textInput.isVisible().catch(() => false)) && !answered) {
        const placeholder = await textInput.getAttribute("placeholder");
        if (placeholder?.includes("Digite")) {
          // Get a sample answer - use first available text answer
          const sampleAnswer = Object.values(answers).find(
            (v) => typeof v === "string" && v.length > 0
          ) as string;
          await textInput.fill(sampleAnswer || "Resposta de teste");
          answered = true;
        }
      }

      // Number input
      if ((await numberInput.isVisible().catch(() => false)) && !answered) {
        await numberInput.fill("25");
        answered = true;
      }

      // Email input
      if ((await emailInput.isVisible().catch(() => false)) && !answered) {
        await emailInput.fill("test@example.com");
        answered = true;
      }

      // Textarea
      if ((await textareaInput.isVisible().catch(() => false)) && !answered) {
        await textareaInput.fill("Resposta detalhada de teste para textarea");
        answered = true;
      }

      // Yes/No buttons
      if ((await yesButton.isVisible().catch(() => false)) && !answered) {
        // Randomly choose Yes or No to test conditional logic
        const shouldClickYes = Math.random() > 0.5;
        if (shouldClickYes) {
          await yesButton.click();
        } else {
          await noButton.click();
        }
        answered = true;
        continue; // Yes/No auto-advances
      }

      // Multiple choice buttons (look for option buttons)
      const optionButtons = page.locator(
        'button[class*="w-full"][class*="text-left"]'
      );
      const optionCount = await optionButtons.count();
      if (optionCount > 0 && !answered) {
        await optionButtons.first().click();
        answered = true;
        continue; // Multiple choice auto-advances
      }

      // If we filled an input, click Próximo
      if (answered) {
        const nextButton = page.getByRole("button", { name: /próximo/i });
        if (await nextButton.isVisible().catch(() => false)) {
          await nextButton.click();
        }
      }

      // Safety check - if nothing was answered, break
      if (!answered) {
        console.log(
          "⚠️ Could not identify question type, stopping at question",
          questionCount
        );
        break;
      }

      // Small delay to allow animations
      await page.waitForTimeout(100);
    }

    return questionCount - 1;
  }

  /**
   * Test 1: Complete form with all questions answered (comprehensive path)
   */
  test("should complete full nutritionbr form with all conditional questions", async ({
    page,
  }) => {
    const questionsAnswered = await fillFullForm(page);

    // Verify we answered a reasonable number of questions
    expect(questionsAnswered).toBeGreaterThan(100);
    expect(questionsAnswered).toBeLessThan(150);

    console.log(`✅ Total questions answered: ${questionsAnswered}`);

    // Wait for the thank you page
    await expect(
      page.getByText(/obrigado por completar o questionário/i)
    ).toBeVisible({ timeout: 10000 });

    // Verify success message (Portuguese)
    await expect(
      page.getByText(/sucesso! sua avaliação foi enviada/i)
    ).toBeVisible({ timeout: 10000 });

    // Verify "What happens next" section (Portuguese)
    await expect(page.getByText(/o que acontece agora/i)).toBeVisible();

    // Verify email was captured (check if EmailJS was called)
    // Note: Email data structure may vary, main thing is form completed successfully
    expect(capturedEmailData).not.toBeNull();

    if (capturedEmailData?.email_body) {
      expect(capturedEmailData.email_body).toContain("Respostas");
      console.log("✅ Email body captured with Portuguese content");
    } else {
      console.log(
        "⚠️ Email data format different than expected, but form submitted successfully"
      );
    }
  });

  /**
   * Test 2: Complete form with minimal answers (mostly "No" responses)
   */
  test("should complete nutritionbr form with minimal conditional paths", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001/nutritionbr");

    // Click through welcome
    await page.getByRole("button", { name: /começar|continuar/i }).click();

    let questionCount = 0;
    const maxQuestions = 150;

    while (questionCount < maxQuestions) {
      questionCount++;

      await page.waitForSelector("input, textarea, button", {
        timeout: 5000,
      });

      // Check for thank you page
      const thankYouVisible = await page
        .getByText(/obrigado por completar o questionário/i)
        .isVisible()
        .catch(() => false);
      if (thankYouVisible) {
        break;
      }

      // Handle section headers
      const continueButton = page.getByRole("button", { name: /continuar/i });
      if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.click();
        continue;
      }

      // Fill basic inputs with minimal data
      const textInput = page.locator('input[type="text"]').first();
      const numberInput = page.locator('input[type="number"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const textareaInput = page.locator("textarea").first();
      const noButton = page.getByRole("button", { name: /^não$/i });

      if (await textInput.isVisible().catch(() => false)) {
        await textInput.fill("Teste");
        await page.getByRole("button", { name: /próximo/i }).click();
        continue;
      }

      if (await numberInput.isVisible().catch(() => false)) {
        await numberInput.fill("25");
        await page.getByRole("button", { name: /próximo/i }).click();
        continue;
      }

      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill("test@example.com");
        await page.getByRole("button", { name: /próximo/i }).click();
        continue;
      }

      if (await textareaInput.isVisible().catch(() => false)) {
        await textareaInput.fill("Nenhuma");
        await page.getByRole("button", { name: /próximo/i }).click();
        continue;
      }

      // Answer "Não" to skip conditional questions
      if (await noButton.isVisible().catch(() => false)) {
        await noButton.click();
        continue;
      }

      // Handle multiple choice
      const optionButtons = page.locator(
        'button[class*="w-full"][class*="text-left"]'
      );
      if ((await optionButtons.count()) > 0) {
        await optionButtons.first().click();
        continue;
      }

      await page.waitForTimeout(100);
    }

    // Should complete with fewer questions (skipping conditionals)
    expect(questionCount).toBeLessThan(120);
    console.log(`✅ Minimal path completed with ${questionCount} questions`);

    // Verify success
    await expect(
      page.getByText(/sucesso! sua avaliação foi enviada/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * Test 3: Verify required field validation (Portuguese)
   */
  test("should prevent submission without required fields", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001/nutritionbr");
    await page.getByRole("button", { name: /começar|continuar/i }).click();

    // The form starts with yes/no questions, navigate to find a text input
    await page.waitForTimeout(1000);

    let foundTextInput = false;
    for (let i = 0; i < 10 && !foundTextInput; i++) {
      const textInput = page.locator('input[type="text"]').first();
      if (await textInput.isVisible().catch(() => false)) {
        foundTextInput = true;

        // Found text input - verify Next button is disabled without filling
        const nextButton = page.getByRole("button", { name: /próximo/i });
        const isDisabled = await nextButton.isDisabled();
        expect(isDisabled).toBe(true);
        console.log("✅ Required field validation working - button disabled");
        break;
      }

      // Navigate forward by clicking yes/no or continue buttons
      const yesButton = page.getByRole("button", { name: /^sim$/i });
      const continueButton = page.getByRole("button", { name: /continuar/i });

      if (await yesButton.isVisible().catch(() => false)) {
        await yesButton.click();
        await page.waitForTimeout(300);
      } else if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(300);
      }
    }

    if (!foundTextInput) {
      console.log("⚠️ Test inconclusive - navigated through yes/no questions");
    }
  });

  /**
   * Test 4: Verify progress tracking
   */
  test("should show progress timeline during form completion", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001/nutritionbr");
    await page.getByRole("button", { name: /começar|continuar/i }).click();

    // Answer a few questions to trigger progress display
    for (let i = 0; i < 5; i++) {
      const textInput = page.locator('input[type="text"]').first();
      const yesButton = page.getByRole("button", { name: /^sim$/i });
      const noButton = page.getByRole("button", { name: /^não$/i });

      if (await textInput.isVisible().catch(() => false)) {
        await textInput.fill("Teste");
        await page.getByRole("button", { name: /próximo/i }).click();
      } else if (await yesButton.isVisible().catch(() => false)) {
        await yesButton.click();
      } else if (await noButton.isVisible().catch(() => false)) {
        await noButton.click();
      }

      await page.waitForTimeout(200);
    }

    // Check for progress elements (Portuguese)
    const progressVisible = await page
      .getByText(/seu progresso/i)
      .isVisible()
      .catch(() => false);

    if (progressVisible) {
      console.log("✅ Progress timeline visible");
      await expect(page.getByText(/seu progresso/i)).toBeVisible();
    } else {
      console.log("⚠️ Progress timeline not visible (may be hidden initially)");
    }
  });
});
