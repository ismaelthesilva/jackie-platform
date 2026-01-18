import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "./route";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("POST /api/v1/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns endpoint info on GET request", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe(
      "Register endpoint is working. Use POST to create a user.",
    );
    expect(data.requiredFields).toEqual(["name", "email", "password", "role"]);
    expect(data.roles).toEqual(["PT", "MEMBER"]);
  });

  it("successfully registers a new user", async () => {
    const mockUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: Role.MEMBER,
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(hash).mockResolvedValue("hashedpassword" as never);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "MEMBER",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toEqual({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "MEMBER",
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });
    expect(hash).toHaveBeenCalledWith("password123", 12);
  });

  it("returns 400 when missing required fields", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          // missing password and role
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 409 when user already exists", async () => {
    const existingUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: Role.MEMBER,
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "MEMBER",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("User already exists");
  });

  it("returns 500 on database error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("Database error"),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "MEMBER",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");

    consoleErrorSpy.mockRestore();
  });

  it("hashes password before storing", async () => {
    const mockUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: Role.MEMBER,
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(hash).mockResolvedValue("hashedpassword" as never);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "MEMBER",
        }),
      },
    );

    await POST(request);

    expect(hash).toHaveBeenCalledWith("password123", 12);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        role: "MEMBER",
      },
    });
  });

  it("does not return password in response", async () => {
    const mockUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: Role.MEMBER,
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(hash).mockResolvedValue("hashedpassword" as never);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "MEMBER",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.user.password).toBeUndefined();
    expect(data.user).not.toHaveProperty("password");
  });
});
