import fs from "fs";
import path from "path";

function normalizeImagePath(p: string): string {
  if (!p) return p;
  const trimmed = String(p).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  let s = trimmed;
  if (s.startsWith("/")) s = s.slice(1);
  if (s.startsWith("exercises/")) s = s.slice("exercises/".length);
  return s;
}

export function getAllExercises(): any[] {
  const exercisesDir = path.join(process.cwd(), "public/exercises");
  const folders = fs.readdirSync(exercisesDir);
  const exercises: any[] = [];

  folders.forEach((folder) => {
    const jsonPath = path.join(exercisesDir, folder, `${folder}.json`);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      if (Array.isArray(data.images)) {
        data.images = data.images.map((p: string) => normalizeImagePath(p));
      }
      exercises.push(data);
    }
  });

  return exercises;
}
