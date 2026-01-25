import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAllExercises } from "@/lib/exercises";

// Helper: Count usage of static exercises (by name) from workout_exercises
async function getStaticExerciseUsage() {
  // This is a placeholder. You may want to implement a better way to track static exercise usage.
  // For now, just return all static exercises with count 0.
  const staticExercises = getAllExercises();
  return staticExercises.map((ex) => ({ ...ex, usageCount: 0 }));
}

export async function GET() {
  try {
    // Get dynamic exercises usage from DB
    const dynamic = await prisma.exercise.findMany({
      include: {
        workoutExercises: true,
      },
    });
    const dynamicWithUsage = dynamic.map((ex) => ({
      ...ex,
      usageCount: ex.workoutExercises.length,
    }));

    // Get static exercises usage (placeholder)
    const staticWithUsage = await getStaticExerciseUsage();

    // Merge and sort by usageCount desc
    const all = [...dynamicWithUsage, ...staticWithUsage];
    all.sort((a, b) => b.usageCount - a.usageCount);

    // Return top 20
    return NextResponse.json({ exercises: all.slice(0, 20) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch top exercises" },
      { status: 500 },
    );
  }
}
