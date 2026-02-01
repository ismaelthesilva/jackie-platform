/**
 * Migration Script: Import exercises from JSON files to PostgreSQL
 *
 * Usage: npx ts-node scripts/migrate-exercises-to-db.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Top 40 most popular exercises (you can adjust this list)
const TOP_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Pull-Up",
  "Dumbbell Curl",
  "Barbell Curl",
  "Overhead Press",
  "Romanian Deadlift",
  "Leg Press",
  "Lat Pulldown",
  "Cable Chest Fly",
  "Incline Bench Press",
  "Dumbbell Shoulder Press",
  "Tricep Dips",
  "Skull Crushers",
  "Hammer Curls",
  "Leg Extension",
  "Leg Curl",
  "Calf Raises",
  "Cable Rows",
  "T-Bar Row",
  "Dumbbell Row",
  "Face Pulls",
  "Lateral Raises",
  "Front Raises",
  "Shrugs",
  "Decline Bench Press",
  "Chest Press Machine",
  "Pec Deck",
  "Cable Crossover",
  "Lunges",
  "Bulgarian Split Squat",
  "Hip Thrust",
  "Glute Bridge",
  "Plank",
  "Ab Crunch",
  "Russian Twist",
  "Mountain Climbers",
  "Burpees",
  "Box Jumps",
];

function normalizeImagePath(p: string): string {
  if (!p) return p;
  const trimmed = String(p).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  let s = trimmed;
  if (s.startsWith("/")) s = s.slice(1);
  if (s.startsWith("exercises/")) s = s.slice("exercises/".length);
  return s;
}

async function migrateExercises() {
  console.log("🚀 Starting exercise migration...\n");

  const exercisesDir = path.join(process.cwd(), "public/exercises");

  if (!fs.existsSync(exercisesDir)) {
    console.error("❌ Exercises directory not found:", exercisesDir);
    process.exit(1);
  }

  const folders = fs.readdirSync(exercisesDir);
  console.log(`📁 Found ${folders.length} exercise folders\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const folder of folders) {
    const jsonPath = path.join(exercisesDir, folder, `${folder}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️  Skipping ${folder} - no JSON file`);
      skipped++;
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

      // Normalize images
      const images = Array.isArray(data.images)
        ? data.images.map((p: string) => normalizeImagePath(p))
        : [];

      // Calculate popularity (higher = more popular)
      const popularity = TOP_EXERCISES.findIndex(
        (ex) => ex.toLowerCase() === data.name.toLowerCase(),
      );
      const popularityScore = popularity >= 0 ? 100 - popularity : 0;

      // Upsert exercise
      await prisma.exercise.upsert({
        where: { name: data.name },
        update: {
          force: data.force || null,
          level: data.level || null,
          mechanic: data.mechanic || null,
          equipment: data.equipment || null,
          primaryMuscles: data.primaryMuscles || [],
          secondaryMuscles: data.secondaryMuscles || [],
          instructions: data.instructions || [],
          category: data.category || null,
          images: images,
          popularity: popularityScore,
        },
        create: {
          id: data.id || folder,
          name: data.name,
          force: data.force || null,
          level: data.level || null,
          mechanic: data.mechanic || null,
          equipment: data.equipment || null,
          primaryMuscles: data.primaryMuscles || [],
          secondaryMuscles: data.secondaryMuscles || [],
          instructions: data.instructions || [],
          category: data.category || null,
          images: images,
          popularity: popularityScore,
        },
      });

      imported++;

      if (imported % 50 === 0) {
        console.log(`✅ Imported ${imported} exercises...`);
      }
    } catch (error: any) {
      console.error(`❌ Error importing ${folder}:`, error.message);
      errors++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📈 Total: ${folders.length}\n`);

  // Verify top exercises
  const topExercises = await prisma.exercise.findMany({
    where: { popularity: { gt: 0 } },
    orderBy: { popularity: "desc" },
    take: 10,
    select: { name: true, popularity: true },
  });

  console.log("🏆 Top 10 Popular Exercises:");
  topExercises.forEach((ex, i) => {
    console.log(`   ${i + 1}. ${ex.name} (score: ${ex.popularity})`);
  });

  console.log("\n✨ Migration completed!\n");
}

migrateExercises()
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
