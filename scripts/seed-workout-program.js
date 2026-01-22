require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function loadPublicExercises() {
  const dir = path.join(process.cwd(), "public", "exercises");
  if (!fs.existsSync(dir)) return [];
  const folders = fs.readdirSync(dir).filter((d) => {
    try {
      return fs.statSync(path.join(dir, d)).isDirectory();
    } catch (e) {
      return false;
    }
  });

  const items = [];
  for (const f of folders) {
    const jsonPath = path.join(dir, f, `${f}.json`);
    if (!fs.existsSync(jsonPath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      items.push(data);
    } catch (e) {
      console.warn(`Skipping invalid JSON ${jsonPath}: ${e.message}`);
    }
  }
  return items;
}

async function main() {
  const exercises = await loadPublicExercises();
  if (exercises.length === 0) {
    console.log("No public exercises found in public/exercises/*.json");
    return;
  }

  // determine createdById: env.SEED_CREATED_BY_ID or first PT user
  let createdById = process.env.SEED_CREATED_BY_ID;
  if (!createdById) {
    const pt = await prisma.user.findFirst({ where: { role: "PT" } });
    if (!pt) {
      console.error(
        "No PT user found and SEED_CREATED_BY_ID not set. Create a PT user or set env.",
      );
      process.exit(1);
    }
    createdById = pt.id;
    console.log("Using PT user id:", createdById);
  }

  const fallbackVideo = process.env.VIDEO_URL_FALLBACK ?? null;
  let created = 0;
  let updated = 0;

  for (const it of exercises) {
    const item = { ...it };
    delete item.image;
    delete item.images;

    const name = (item.name || "").trim();
    const videoUrl = item.videoUrl || fallbackVideo;
    if (!name) {
      console.warn("Skipping exercise without name:", item);
      continue;
    }
    if (!videoUrl) {
      console.warn(
        "Skipping exercise without videoUrl (and no VIDEO_URL_FALLBACK):",
        name,
      );
      continue;
    }

    const data = {
      name,
      videoUrl,
      description: item.description ?? null,
      muscleGroup: item.primaryMuscles
        ? item.primaryMuscles.join(", ")
        : (item.muscleGroup ?? null),
      difficulty: item.level ?? item.difficulty ?? null,
      createdById,
    };

    try {
      // `name` is not a unique field in the schema, use findFirst instead
      const existing = await prisma.exercise.findFirst({ where: { name } });
      if (existing) {
        await prisma.exercise.update({ where: { id: existing.id }, data });
        updated++;
        console.log("Updated exercise:", name);
      } else {
        await prisma.exercise.create({ data });
        created++;
        console.log("Created exercise:", name);
      }
    } catch (e) {
      console.error("Failed to upsert", name, e.message);
    }
  }

  console.log(`Done. created=${created} updated=${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
