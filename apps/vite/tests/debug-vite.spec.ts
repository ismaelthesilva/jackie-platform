import { test, expect } from "@playwright/test";
import fs from "fs";

test("capture console logs and screenshot for Vite app", async ({ page }) => {
  const url = "http://localhost:3003/";
  const logs: string[] = [];

  page.on("console", (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
    console.log("PAGE LOG:", text);
  });

  page.on("pageerror", (err) => {
    const text = `[pageerror] ${err.message}`;
    logs.push(text);
    console.error("PAGE ERROR:", err);
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // wait a bit for scripts to run
  await page.waitForTimeout(2000);

  const screenshotPath = "tests/vite-page-screenshot.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Saved screenshot to", screenshotPath);

  const logPath = "tests/vite-console-logs.txt";
  fs.writeFileSync(logPath, logs.join("\n"));
  console.log("Saved console logs to", logPath);

  // Attach a simple assertion so Playwright reports a pass/fail
  expect(true).toBe(true);
});
