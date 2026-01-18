import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import prisma from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe("GET /api/v1/migrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns list of migrations", async () => {
    const mockMigrations = [
      {
        id: "20260117100655_init",
        checksum: "checksum123",
        finished_at: new Date("2026-01-17T10:06:56.000Z"),
        migration_name: "20260117100655_init",
        logs: null,
        rolled_back_at: null,
        started_at: new Date("2026-01-17T10:06:55.000Z"),
        applied_steps_count: 5,
      },
    ];

    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockMigrations);

    const request = new NextRequest("http://localhost:3000/api/v1/migrations");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.migrations).toHaveLength(1);
    expect(data.migrations[0]).toEqual({
      id: "20260117100655_init",
      name: "20260117100655_init",
      status: "applied",
      started_at: "2026-01-17T10:06:55.000Z",
      finished_at: "2026-01-17T10:06:56.000Z",
      rolled_back_at: null,
      applied_steps: 5,
    });
    expect(data.total).toBe(1);
  });

  it("returns empty array when no migrations exist", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/v1/migrations");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.migrations).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("handles pending migrations", async () => {
    const mockMigrations = [
      {
        id: "20260117100655_pending",
        checksum: "checksum456",
        finished_at: null,
        migration_name: "20260117100655_pending",
        logs: null,
        rolled_back_at: null,
        started_at: new Date("2026-01-17T10:06:55.000Z"),
        applied_steps_count: 0,
      },
    ];

    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockMigrations);

    const request = new NextRequest("http://localhost:3000/api/v1/migrations");
    const response = await GET(request);
    const data = await response.json();

    expect(data.migrations[0].status).toBe("pending");
  });

  it("handles rolled back migrations", async () => {
    const mockMigrations = [
      {
        id: "20260117100655_rolled_back",
        checksum: "checksum789",
        finished_at: new Date("2026-01-17T10:06:56.000Z"),
        migration_name: "20260117100655_rolled_back",
        logs: null,
        rolled_back_at: new Date("2026-01-17T10:07:00.000Z"),
        started_at: new Date("2026-01-17T10:06:55.000Z"),
        applied_steps_count: 5,
      },
    ];

    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockMigrations);

    const request = new NextRequest("http://localhost:3000/api/v1/migrations");
    const response = await GET(request);
    const data = await response.json();

    expect(data.migrations[0].status).toBe("rolled_back");
  });

  it("returns 500 on database error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new NextRequest("http://localhost:3000/api/v1/migrations");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch migrations");
    expect(data.details).toBe("Database connection failed");

    consoleErrorSpy.mockRestore();
  });
});

describe("POST /api/v1/migrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns message for apply action", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/migrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain("npx prisma migrate deploy");
  });

  it("returns error for invalid action", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/migrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invalid" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid action. Use 'apply' to run migrations.");
  });

  it("returns 500 on request parsing error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const request = new NextRequest("http://localhost:3000/api/v1/migrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Migration operation failed");

    consoleErrorSpy.mockRestore();
  });
});
