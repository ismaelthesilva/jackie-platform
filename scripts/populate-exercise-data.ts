import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Normalize exercise name to match folder naming convention
function normalizeName(name: string): string {
  return name
    .replace(/\s+/g, "_")
    .replace(/\//g, "_")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/,/g, "")
    .replace(/'/g, "")
    .replace(/"/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface ExerciseJSON {
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string | null;
  images?: string[];
  id?: string;
}

async function populateExerciseData() {
  try {
    console.log("Starting to populate exercise data from JSON files...\n");

    const exercisesDir = path.join(process.cwd(), "public", "exercises");

    // Get all exercise folders
    const folders = fs
      .readdirSync(exercisesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    console.log(`Found ${folders.length} exercise folders\n`);

    // Get all exercises from database
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        force: true,
        level: true,
        mechanic: true,
        equipment: true,
        primaryMuscles: true,
        secondaryMuscles: true,
        instructions: true,
        category: true,
      },
    });

    console.log(`Found ${exercises.length} exercises in database\n`);

    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    let errors = 0;

    for (const exercise of exercises) {
      try {
        // Find matching folder
        const normalizedName = normalizeName(exercise.name);
        const matchingFolder = folders.find(
          (folder) =>
            folder.toLowerCase() === normalizedName.toLowerCase() ||
            folder.replace(/_/g, "-").toLowerCase() ===
              normalizedName.replace(/_/g, "-").toLowerCase(),
        );

        if (!matchingFolder) {
          notFound++;
          if (notFound <= 5) {
            console.log(`⚠️  No folder found for: ${exercise.name}`);
          }
          continue;
        }

        // Try to find JSON file
        const jsonPath = path.join(
          exercisesDir,
          matchingFolder,
          `${matchingFolder}.json`,
        );

        if (!fs.existsSync(jsonPath)) {
          notFound++;
          if (notFound <= 5) {
            console.log(
              `⚠️  No JSON file found for: ${exercise.name} (${matchingFolder})`,
            );
          }
          continue;
        }

        // Read JSON file
        const jsonContent = fs.readFileSync(jsonPath, "utf-8");
        const jsonData: ExerciseJSON = JSON.parse(jsonContent);

        // Check if exercise already has data (skip if populated)
        const hasData =
          exercise.force ||
          exercise.level ||
          exercise.mechanic ||
          exercise.equipment ||
          (exercise.primaryMuscles && exercise.primaryMuscles.length > 0) ||
          (exercise.instructions && exercise.instructions.length > 0);

        if (hasData) {
          skipped++;
          continue;
        }

        // Prepare update data
        const updateData: any = {};

        if (jsonData.force) updateData.force = jsonData.force;
        if (jsonData.level) updateData.level = jsonData.level;
        if (jsonData.mechanic) updateData.mechanic = jsonData.mechanic;
        if (jsonData.equipment) updateData.equipment = jsonData.equipment;
        if (jsonData.category) updateData.category = jsonData.category;

        if (jsonData.primaryMuscles && jsonData.primaryMuscles.length > 0) {
          updateData.primaryMuscles = jsonData.primaryMuscles;
        }

        if (jsonData.secondaryMuscles && jsonData.secondaryMuscles.length > 0) {
          updateData.secondaryMuscles = jsonData.secondaryMuscles;
        }

        if (jsonData.instructions && jsonData.instructions.length > 0) {
          updateData.instructions = jsonData.instructions;
        }

        // Map level to difficulty if difficulty is not set
        if (jsonData.level && !exercise.level) {
          const levelMap: Record<string, string> = {
            beginner: "BEGINNER",
            intermediate: "INTERMEDIATE",
            advanced: "ADVANCED",
            expert: "ADVANCED",
          };
          const mappedLevel = levelMap[jsonData.level.toLowerCase()];
          if (mappedLevel) {
            updateData.difficulty = mappedLevel;
          }
        }

        // Update exercise
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: updateData,
        });

        updated++;
        if (updated <= 20) {
          console.log(`✅ Updated ${exercise.name}`);
        } else if (updated === 21) {
          console.log(`... (showing first 20 updates)\n`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.error(
            `❌ Error updating ${exercise.name}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped (already had data): ${skipped}`);
    console.log(`  ⚠️  Not found: ${notFound}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📁 Total: ${exercises.length}`);
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateExerciseData();
