import fs from "fs";
import path from "path";

export function getAllExercises(): any[] {
  const exercisesDir = path.join(process.cwd(), "public/exercises");
  const folders = fs.readdirSync(exercisesDir);
  const exercises: any[] = [];

  folders.forEach((folder) => {
    const jsonPath = path.join(exercisesDir, folder, `${folder}.json`);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      exercises.push(data);
    }
  });

  return exercises;
}
