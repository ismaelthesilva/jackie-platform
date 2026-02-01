import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ exercises: [] });
    }

    // Search exercises by name (case-insensitive)
    const exercises = await prisma.exercise.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: {
        name: "asc",
      },
      take: Math.min(limit, 100),
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
  } catch (error: any) {
    console.error("GET /api/v1/exercises/search error:", error);
    return NextResponse.json(
      { error: "Failed to search exercises" },
      { status: 500 },
    );
  }
}
