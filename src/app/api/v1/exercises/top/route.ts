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
  "Barbell_Squat",
  "Axle_Deadlift", // Confirm folder exists
  "Bench_Press_Powerlifting", // Confirm folder exists
  "Pullups",
  "Push_Up", // Confirm folder exists
  "Overhead_Press", // Confirm folder exists
  "Barbell_Row", // Confirm folder exists
  "Lat_Pulldown", // Confirm folder exists
  "Dumbbell_Curl", // Confirm folder exists
  "Triceps_Pushdown",
  "Leg_Press",
  "Lunge", // Confirm folder exists
  "Leg_Extension", // Confirm folder exists
  "Leg_Curl", // Confirm folder exists
  "Calf_Raise", // Confirm folder exists
  "Chest_Fly", // Confirm folder exists
  "Incline_Bench_Press", // Confirm folder exists
  "Dips", // Confirm folder exists
  "Seated_Row", // Confirm folder exists
  "Face_Pull", // Confirm folder exists
  "Hammer_Curl", // Confirm folder exists
  "Skullcrusher", // Confirm folder exists
  "Cable_Crossover",
  "Pec_Deck", // Confirm folder exists
  "Arnold_Dumbbell_Press",
  "Lateral_Raise", // Confirm folder exists
  "Front_Raise", // Confirm folder exists
  "Rear_Delt_Fly", // Confirm folder exists
  "Shrug", // Confirm folder exists
  "Hip_Thrust", // Confirm folder exists
  "Glute_Bridge", // Confirm folder exists
  "Russian_Twist",
  "Plank",
  "Crunch",
  "Hanging_Leg_Raise", // Confirm folder exists
  "Mountain_Climber", // Confirm folder exists
  "Farmers_Walk",
  "Step_Up", // Confirm folder exists
  "Bulgarian_Split_Squat", // Confirm folder exists
  "Good_Morning",
  "Romanian_Deadlift",
];

// Helper: Get details for top 40 from static or DB
async function getGlobalTop40Exercises() {
  // Only load the top 40 exercises by name, not all 800+
  const staticExercises =
    require("@/lib/exercises").getExercisesByNames(GLOBAL_TOP_40);
  // Map to preserve order and fill missing
  const topList = GLOBAL_TOP_40.map((name, idx) => {
    const match = staticExercises.find(
      (ex: any) => ex.name.toLowerCase() === name.toLowerCase(),
    );
    return match
      ? { ...match, usageCount: 999 - idx }
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
