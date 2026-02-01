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

async function updateExerciseImages() {
  try {
    console.log("Updating exercise images...");

    const exercisesDir = path.join(process.cwd(), "public", "exercises");

    // Get all exercise folders
    const allFolders = fs
      .readdirSync(exercisesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    console.log(`Found ${allFolders.length} exercise folders`);

    // Get all exercises from database
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    console.log(`Found ${exercises.length} exercises in database`);

    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const exercise of exercises) {
      // Check if images already populated
      if (exercise.images && exercise.images.length > 0) {
        skipped++;
        continue;
      }

      // Try to find folder by normalizing exercise name
      const normalizedName = normalizeName(exercise.name);
      const matchingFolder = allFolders.find(
        (folder) =>
          folder.toLowerCase() === normalizedName.toLowerCase() ||
          folder.replace(/_/g, "-").toLowerCase() ===
            normalizedName.replace(/_/g, "-").toLowerCase(),
      );

      if (!matchingFolder) {
        notFound++;
        if (notFound <= 10) {
          // Only show first 10 to avoid spam
          console.log(
            `  ⚠️  No folder found for: ${exercise.name} (looking for: ${normalizedName})`,
          );
        }
        continue;
      }

      const exerciseFolder = path.join(exercisesDir, matchingFolder);

      // Get all jpg/png images in the folder
      const files = fs.readdirSync(exerciseFolder);
      const imageFiles = files
        .filter(
          (f) => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".gif"),
        )
        .sort() // Ensure consistent ordering (0.jpg, 1.jpg, etc.)
        .map((f) => `exercises/${matchingFolder}/${f}`);

      if (imageFiles.length > 0) {
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { images: imageFiles },
        });
        updated++;
        if (updated <= 20) {
          // Show first 20 updates
          console.log(
            `  ✅ Updated ${exercise.name}: ${imageFiles.length} images`,
          );
        }
      } else {
        notFound++;
        console.log(`  ⚠️  No images in folder for: ${exercise.name}`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped (already had images): ${skipped}`);
    console.log(`  ⚠️  Not found: ${notFound}`);
    console.log(`  📁 Total: ${exercises.length}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExerciseImages();
