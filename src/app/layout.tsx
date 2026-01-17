import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Dr. Jackie Souto - Nutrition & Fitness Expert",
  description:
    "Professional nutrition and fitness guidance by Dr. Jackie Souto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/jackie-favicon.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider defaultTheme="light" storageKey="dr-jackie-theme">
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
