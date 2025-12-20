"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { submitFormToDatabase } from "@/services/formSubmissionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Brain,
  TestTube,
} from "lucide-react";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";

// Type definitions
interface QuestionCondition {
  id: string;
  value: string;
}

interface BaseQuestion {
  id: string;
  title: string;
  required?: boolean;
  condition?: QuestionCondition;
  description?: string;
  buttonText?: string;
}

interface WelcomeQuestion extends BaseQuestion {
  type: "welcome";
  buttonText: string;
}

interface TextQuestion extends BaseQuestion {
  type: "text" | "number" | "email";
}

interface ThankYouQuestion extends BaseQuestion {
  type: "thank_you";
}

type Question = WelcomeQuestion | TextQuestion | ThankYouQuestion;

interface Answers {
  [key: string]: string | number;
}

export default function TestAIPage() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(
    () => [
      {
        id: "welcome",
        type: "welcome",
        title: "Pre-Registration Test Form",
        description: "Create your pre-signup profile with basic information",
        buttonText: "Start Registration",
      },
      {
        id: "name",
        type: "text",
        title: "What is your full name?",
        description: "This will be used to create your profile in our system",
        required: true,
      },
      {
        id: "age",
        type: "number",
        title: "What is your age?",
        description: "Help us personalize your experience (must be 18+)",
        required: true,
      },
      {
        id: "email",
        type: "email",
        title: "What is your email address?",
        description:
          "You'll use this email to complete your account setup later",
        required: true,
      },
      {
        id: "thankYou",
        type: "thank_you",
        title: "Pre-Registration Complete!",
        description:
          "Your profile has been created. Check your email to complete the signup process.",
      },
    ],
    []
  );

  const handleAnswer = useCallback(
    (questionId: string, answer: string | number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));

      if (questionId === "email") {
        setClientEmail(answer as string);
      }

      // Move to next question
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);

      if (nextIndex === questions.length - 1) {
        setFormCompleted(true);
      }
    },
    [currentQuestion, questions.length]
  );

  const submitFormData = useCallback(async (): Promise<void> => {
    if (!turnstileToken) {
      alert("Please complete the security verification.");
      return;
    }

    setIsLoading(true);
    console.log("🔗 Starting pre-registration submission...");

    try {
      // Prepare form data for pre-signup
      const formData = {
        clientName: String(answers.name || ""),
        clientEmail: clientEmail || "",
        formType: "pre_signup" as const,
        responses: answers,
      };

      console.log("� Pre-registration data:", formData);
      const result = await submitFormToDatabase(formData);

      if (result.success) {
        setEmailSent(true);

        // Show success message
        alert(`✅ Pre-Registration Form Submitted!

Your information has been processed:
- Name: ${answers.name}
- Age: ${answers.age}
- Email: ${formData.clientEmail}

� DEVELOPMENT NOTE: 
Form submission is working correctly! The data is being processed by the server.

🔧 Next: Database integration will be completed once RLS permissions are configured.

For now, you can use this email (${formData.clientEmail}) when the full signup system is ready.`);

        console.log("✅ Test form submitted successfully:", result);
      } else {
        throw new Error(result.error || "Test submission failed");
      }
    } catch (error) {
      console.error("❌ Error in test form submission:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`❌ Test Error: ${errorMessage}. 
      
Please try again or contact us if the problem persists.`);
    } finally {
      setIsLoading(false);
      console.log("🏁 Test process completed, loading state reset");
    }
  }, [answers, clientEmail]);

  useEffect(() => {
    if (formCompleted) {
      submitFormData();
    }
  }, [formCompleted, submitFormData]);

  const renderQuestion = () => {
    const currentQ = questions[currentQuestion];

    const handleKeyPress = (
      e: React.KeyboardEvent,
      value?: string | number
    ) => {
      if (e.key === "Enter" && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || "");
      }
    };

    const handleBack = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
    };

    if (currentQ.type === "welcome") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="h-8 w-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentQ.title}
              </h1>
              <p className="text-lg text-gray-600">{currentQ.description}</p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calculator className="h-4 w-4 mr-1" />
                  <span>Simple Math</span>
                </div>
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  <span>AI Analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Quick Test</span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setCurrentQuestion(1)}
              className="px-8 bg-purple-600 hover:bg-purple-700"
            >
              {currentQ.buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "thank_you") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentQ.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {currentQ.description}
              </p>

              {/* Show registration summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  Registration Summary:
                </h3>
                <div className="text-left space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {answers.name}
                  </p>
                  <p>
                    <strong>Age:</strong> {answers.age} years old
                  </p>
                  <p>
                    <strong>Email:</strong> {answers.email}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {Number(answers.age) >= 18
                      ? "✅ Age Verified"
                      : "⚠️ Must be 18+"}
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-purple-600 mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <p className="text-sm">
                    Creating your pre-registration profile...
                  </p>
                </div>
              )}

              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    🎉 Profile created successfully! Check your email to
                    complete signup.
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Use the same email to finish your account setup anytime.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl mx-auto" ref={formRef}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
              {currentQuestion}
            </span>
            {currentQ.title}
          </CardTitle>
          {currentQ.description && (
            <p className="text-sm text-gray-600 mt-2 ml-11">
              {currentQ.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <Input
              type={currentQ.type as "text" | "number" | "email"}
              placeholder={
                currentQ.type === "email"
                  ? "your.email@example.com"
                  : currentQ.type === "number"
                  ? "Enter your answer"
                  : "Type your answer..."
              }
              value={(answers[currentQ.id] as string) || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQ.id]:
                    currentQ.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                }))
              }
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
              className="text-base p-3"
            />

            {/* Show Turnstile only for email field */}
            {currentQ.type === "email" && (
              <div className="flex justify-center">
                <CloudflareTurnstile
                  onSuccess={setTurnstileToken}
                  onError={() => {
                    setTurnstileToken("");
                  }}
                />
              </div>
            )}

            {/* Age validation hint */}
            {currentQ.id === "age" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  � <strong>Age Requirement:</strong> You must be 18 years or
                  older to create an account. Your age helps us personalize your
                  health and fitness recommendations.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              {currentQuestion > 1 ? (
                <Button variant="outline" onClick={handleBack} className="px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={() =>
                  handleAnswer(currentQ.id, answers[currentQ.id] || "")
                }
                disabled={
                  (currentQ.required && !answers[currentQ.id]) ||
                  (currentQ.id === "age" &&
                    Number(answers[currentQ.id]) < 18) ||
                  (currentQ.type === "email" && !turnstileToken)
                }
                className="px-6 bg-purple-600 hover:bg-purple-700"
              >
                {currentQuestion === questions.length - 2
                  ? "Create Profile"
                  : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const progressPercentage = (currentQuestion / (questions.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress bar at top */}
        {currentQuestion > 0 && currentQuestion < questions.length - 1 && (
          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pre-Registration Form</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 shadow-sm">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Main question card - centered */}
        <div className="flex justify-center items-center">
          {renderQuestion()}
        </div>

        {/* Pre-Registration Info Footer */}
        {currentQuestion === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                🚀 Pre-Registration Benefits:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>Quick Setup:</strong> Save your basic info now,
                  complete signup later
                </li>
                <li>
                  • <strong>Priority Access:</strong> Get early access to new
                  features and services
                </li>
                <li>
                  • <strong>Personalized Experience:</strong> We'll customize
                  your dashboard based on your age and preferences
                </li>
                <li>
                  • <strong>Easy Completion:</strong> Use the same email to
                  finish your full account setup anytime
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
