import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET single exercise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 },
      );
    }

    // Only PT who created it can view
    if (exercise.createdById !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "PT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 },
      );
    }

    if (exercise.createdById !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, videoUrl, muscleGroup, difficulty } =
      await request.json();

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: {
        name,
        description,
        videoUrl,
        muscleGroup,
        // Only include difficulty if it's a valid enum value
        ...(difficulty &&
        ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty)
          ? { difficulty }
          : {}),
      },
    });

    return NextResponse.json({ exercise: updatedExercise }, { status: 200 });
  } catch (error) {
    console.error("Failed to update exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "PT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 },
      );
    }

    if (exercise.createdById !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Exercise deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
