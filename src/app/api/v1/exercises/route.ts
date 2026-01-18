import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET all exercises
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PTs can view exercises
    if (session.role !== "PT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        createdById: session.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
