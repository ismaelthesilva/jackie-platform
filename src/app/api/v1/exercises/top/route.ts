import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper: Parse limit from request
function getLimitFromRequest(request?: Request) {
  if (!request) return 40;
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "40", 10);
    return Math.max(1, Math.min(limit, 100));
  } catch {
    return 40;
  }
}

// GET /api/v1/exercises/top - Returns exercises ordered by name for now
export async function GET(request: Request) {
  try {
    const limit = getLimitFromRequest(request);

    // Fetch exercises (ordered by name for now until we populate the database properly)
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: "asc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        videoUrl: true,
        description: true,
        muscleGroup: true,
        difficulty: true,
      },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("Error fetching top exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch top exercises" },
      { status: 500 },
    );
  }
}
