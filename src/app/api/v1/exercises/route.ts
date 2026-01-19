import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getAllExercises } from "@/lib/exercises";

// GET all static exercises from public/exercises
export async function GET_static() {
  const exercises = getAllExercises();
  return NextResponse.json(exercises);
}

// GET all exercises
export async function GET(request: NextRequest) {
  try {
    // Get static exercises from public/exercises
    const staticExercises = getAllExercises();

    // Get dynamic exercises from database (YouTube links, etc.)
    let dynamicExercises: any[] = [];
    try {
      const session = await getSession();
      if (session && session.role === "PT") {
        dynamicExercises = await prisma.exercise.findMany({
          where: { createdById: session.userId },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch {}

    // Merge static and dynamic exercises
    const exercises = [...staticExercises, ...dynamicExercises];
    return NextResponse.json({ exercises }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new exercise
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "PT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, videoUrl, muscleGroup, difficulty } =
      await request.json();

    // Validate required fields
    if (!name || !videoUrl) {
      return NextResponse.json(
        { error: "Name and video URL are required" },
        { status: 400 },
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        videoUrl,
        muscleGroup,
        difficulty,
        createdById: session.userId,
      },
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
