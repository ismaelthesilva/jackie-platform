import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAllExercises } from "@/lib/exercises";

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

// Curated global Top 40 exercises (industry standard)
const GLOBAL_TOP_40 = [
  "Barbell Squat",
  "Deadlift",
  "Bench Press",
  "Pull-Up",
  "Push-Up",
  "Overhead Press",
  "Barbell Row",
  "Lat Pulldown",
  "Dumbbell Curl",
  "Triceps Pushdown",
  "Leg Press",
  "Lunge",
  "Leg Extension",
  "Leg Curl",
  "Calf Raise",
  "Chest Fly",
  "Incline Bench Press",
  "Dips",
  "Seated Row",
  "Face Pull",
  "Hammer Curl",
  "Skullcrusher",
  "Cable Crossover",
  "Pec Deck",
  "Arnold Press",
  "Lateral Raise",
  "Front Raise",
  "Rear Delt Fly",
  "Shrug",
  "Hip Thrust",
  "Glute Bridge",
  "Russian Twist",
  "Plank",
  "Crunch",
  "Hanging Leg Raise",
  "Mountain Climber",
  "Farmer's Walk",
  "Step-Up",
  "Bulgarian Split Squat",
  "Good Morning",
  "Romanian Deadlift",
];

// Helper: Get details for top 40 from static or DB
async function getGlobalTop40Exercises() {
  const staticExercises = getAllExercises();
  // Try to match by name (case-insensitive)
  const topList = GLOBAL_TOP_40.map((name, idx) => {
    const match = staticExercises.find(
      (ex) => ex.name.toLowerCase() === name.toLowerCase(),
    );
    return match
      ? { ...match, usageCount: 999 - idx } // High usage for sort, preserve order
      : { id: name, name, usageCount: 999 - idx };
  });
  return topList;
}

export async function GET(request: Request) {
  try {
    const limit = getLimitFromRequest(request);
    const topList = await getGlobalTop40Exercises();
    return NextResponse.json({ exercises: topList.slice(0, limit) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch top exercises" },
      { status: 500 },
    );
  }
}
