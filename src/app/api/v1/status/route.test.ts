import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import prisma from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

describe("GET /api/v1/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns database status successfully", async () => {
    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    // Mock version query
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([
        {
          version: "PostgreSQL 16.0 on x86_64-pc-linux-gnu, compiled by gcc",
        },
      ])
      // Mock max_connections query
      .mockResolvedValueOnce([{ max_connections: "100" }])
      // Mock connections count query
      .mockResolvedValueOnce([{ count: BigInt(5) }]);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("updated_at");
    expect(data.dependencies.database).toEqual({
      status: "healthy",
      version: expect.stringContaining("PostgreSQL"),
      max_connections: 100,
      opened_connections: 5,
    });

    expect(prisma.$connect).toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  it("returns updated_at timestamp", async () => {
    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([{ version: "PostgreSQL 16.0" }])
      .mockResolvedValueOnce([{ max_connections: "100" }])
      .mockResolvedValueOnce([{ count: BigInt(5) }]);

    const beforeTime = new Date().toISOString();
    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();
    const afterTime = new Date().toISOString();

    expect(data.updated_at).toBeDefined();
    expect(data.updated_at >= beforeTime).toBe(true);
    expect(data.updated_at <= afterTime).toBe(true);
  });

  it("handles database connection failure", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(prisma.$connect).mockRejectedValue(
      new Error("Connection refused"),
    );
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database connection failed");
    expect(data.details).toBe("Connection refused");

    expect(prisma.$disconnect).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("handles query execution failure", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Query failed"));
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database connection failed");
    expect(data.details).toBe("Query failed");

    expect(prisma.$disconnect).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("disconnects from database even on error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Query failed"));
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    await GET(request);

    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  it("handles missing version data gracefully", async () => {
    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([]) // No version
      .mockResolvedValueOnce([{ max_connections: "100" }])
      .mockResolvedValueOnce([{ count: BigInt(5) }]);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dependencies.database.version).toBe("Unknown");
  });

  it("parses connection counts correctly", async () => {
    vi.mocked(prisma.$connect).mockResolvedValue(undefined);
    vi.mocked(prisma.$disconnect).mockResolvedValue(undefined);

    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([{ version: "PostgreSQL 16.0" }])
      .mockResolvedValueOnce([{ max_connections: "250" }])
      .mockResolvedValueOnce([{ count: BigInt(42) }]);

    const request = new NextRequest("http://localhost:3000/api/v1/status");
    const response = await GET(request);
    const data = await response.json();

    expect(data.dependencies.database.max_connections).toBe(250);
    expect(data.dependencies.database.opened_connections).toBe(42);
  });
});
