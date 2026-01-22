import prisma from "@/lib/prisma";
import { getAllExercises } from "@/lib/exercises";

export async function getProgramsForUser(userId: string) {
  const programs = await prisma.workoutProgram.findMany({
    where: { createdById: userId },
    include: {
      workoutDays: {
        include: { workoutExercises: { orderBy: { orderIndex: "asc" } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  const staticExercises = getAllExercises();
  const staticById = new Map(staticExercises.map((s: any) => [s.id, s]));

  return programs.map((p) => ({
    ...p,
    workoutDays: p.workoutDays.map((d: any) => ({
      ...d,
      workoutExercises: d.workoutExercises.map((we: any) => ({
        ...we,
        exerciseData: staticById.get(we.exerciseId) ?? null,
      })),
    })),
  }));
}
