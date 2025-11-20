# Playwright Form Testing

## Overview

Automated end-to-end tests for the Nutrition USA form to verify all questions are captured and sent to Dr. Jackie.

## Setup Complete ✅

- Playwright installed
- Chromium browser installed
- Test configuration created
- Test data generators created
- Comprehensive test suite created

## Available Test Commands

```bash
# Run all tests (headless mode)
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests with browser visible
npm run test:headed

# Debug tests step-by-step
npm run test:debug
```

## What's Tested

### 1. Full Form Test

- Completes entire form with all conditional questions
- Answers "Yes" to trigger follow-up questions
- Verifies email is sent with all data
- Checks that 50+ questions are captured

### 2. Minimal Form Test

- Tests shortest path through form
- Answers "No" to skip conditionals
- Verifies form still submits correctly

### 3. Validation Test

- Tests required field validation
- Ensures Next button is disabled on empty fields

### 4. Progress Tracking Test

- Verifies progress bar updates correctly
- Tests visual feedback as user progresses

## Test Files

```
apps/web/
├── tests/
│   ├── nutrition-usa-form.spec.ts       # Main test file
│   └── nutrition-usa-test-data.ts       # Test data generators
├── playwright.config.ts                  # Playwright configuration
└── package.json                          # Test scripts
```

## Running Your First Test

1. **Make sure your dev server is running:**

   ```bash
   npm run dev
   ```

   (Server should be at http://localhost:3001)

2. **Run the test in headed mode to watch it work:**

   ```bash
   npm run test:headed
   ```

3. **Watch the magic!** 🎭
   - Browser opens automatically
   - Form fills itself out
   - All questions answered
   - Email data captured
   - Results displayed in terminal

## Test Results

After running tests, you'll see:

- ✅ Number of questions answered
- ✅ Email data captured
- ✅ Test pass/fail status
- 📊 Detailed logs in terminal

### Example Output:

```
🧪 Starting full form test...
📝 Test data prepared with 134 answers
  Question 1: Full name:
  Question 2: Age:
  ...
✅ Form completed successfully!
📊 Total questions answered: 120
📧 Email body length: 15420 characters
📋 Questions in email: 98
✅ Full form test completed successfully!
```

## Viewing Test Reports

HTML report is generated automatically:

```bash
npx playwright show-report
```

## What Gets Verified

1. ✅ All questions are displayed correctly
2. ✅ Conditional logic works (if Yes → show follow-up)
3. ✅ Form navigation (Next/Back buttons)
4. ✅ Required field validation
5. ✅ Email is sent to Dr. Jackie
6. ✅ All answered questions appear in email
7. ✅ Email contains proper formatting
8. ✅ Progress tracking works

## Troubleshooting

### Test fails to start

- Make sure dev server is running: `npm run dev`
- Check port 3001 is available

### Can't see what's happening

- Use headed mode: `npm run test:headed`
- Use debug mode: `npm run test:debug`

### Test times out

- Form might be taking too long
- Increase timeout in playwright.config.ts

## Benefits

### Before Playwright:

- ❌ 15+ minutes manual testing per form change
- ❌ Easy to miss questions
- ❌ Can't verify email content
- ❌ Human error prone

### After Playwright:

- ✅ 2-3 minutes automated testing
- ✅ Every question verified
- ✅ Email content validated
- ✅ Consistent and reliable
- ✅ Run before every deployment
- ✅ Test multiple scenarios easily

## Next Steps

1. Run your first test with `npm run test:headed`
2. Review the test results
3. Check the HTML report
4. Adapt tests for other forms (nutritionbr, fitnessbr, etc.)

## CI/CD Integration

Tests can run automatically on:

- Git push
- Pull requests
- Before deployment

Just add to your CI pipeline:

```yaml
- run: npm install
- run: npx playwright install chromium
- run: npm test
```

---

**Happy Testing! 🎭**
