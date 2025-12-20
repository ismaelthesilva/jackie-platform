import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders card container", () => {
      render(<Card data-testid="card">Card content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("rounded-xl", "border");
    });

    it("accepts custom className", () => {
      render(
        <Card className="custom-card" data-testid="custom-card">
          Content
        </Card>
      );
      const card = screen.getByTestId("custom-card");
      expect(card).toHaveClass("custom-card");
    });

    it("renders children correctly", () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });

  describe("CardHeader", () => {
    it("renders header section", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex", "flex-col");
    });

    it("accepts custom props", () => {
      render(
        <CardHeader className="custom-header" data-testid="custom-header">
          Header
        </CardHeader>
      );
      const header = screen.getByTestId("custom-header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("renders title with proper styling", () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText("Card Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("font-semibold", "leading-none");
    });

    it("renders as h3 by default", () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText("Title");
      expect(title.tagName).toBe("H3");
    });
  });

  describe("CardDescription", () => {
    it("renders description text", () => {
      render(<CardDescription>Description text</CardDescription>);
      const description = screen.getByText("Description text");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("renders content section", () => {
      render(<CardContent>Content area</CardContent>);
      const content = screen.getByText("Content area");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("p-6");
    });

    it("applies padding styles", () => {
      render(<CardContent data-testid="content">Text</CardContent>);
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("pt-0");
    });
  });

  describe("CardFooter", () => {
    it("renders footer section", () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText("Footer content");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("flex", "items-center");
    });
  });

  describe("Complete Card", () => {
    it("renders all card components together", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>Test description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Test Card")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
      expect(screen.getByText("Card content")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("maintains proper structure", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId("full-card");
      expect(card.children).toHaveLength(2); // Header and Content
    });
  });
});
