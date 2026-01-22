import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function DELETE(request: Request, context: { params: any }) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "PT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = await context.params;
  const id = params?.id;
  try {
    // ensure PT owns program
    const program = await prisma.workoutProgram.findUnique({ where: { id } });
    if (!program)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (program.createdById !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.workoutProgram.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: any }) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "PT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = await context.params;
  const id = params?.id;
  try {
    const body = await request.json();
    const { name, description, assignedToId, workoutDays } = body;

    // ensure program exists and owned by PT
    const program = await prisma.workoutProgram.findUnique({ where: { id } });
    if (!program)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (program.createdById !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // load static exercises to support mapping if client provided slugs/names
    const { getAllExercises } = await import("@/lib/exercises");
    const staticExercises = getAllExercises();

    const mappedDays = [] as any[];
    for (
      let di = 0;
      Array.isArray(workoutDays) && di < workoutDays.length;
      di++
    ) {
      const d = workoutDays[di];
      const dayName = d.dayName ?? `Day ${di + 1}`;
      const orderIndex = d.orderIndex ?? di;

      const wexs: any[] = [];
      const list = Array.isArray(d.workoutExercises) ? d.workoutExercises : [];
      for (let wi = 0; wi < list.length; wi++) {
        const we = list[wi];
        const rawId = we.exerciseId;
        if (!rawId) continue;

        let ex = await prisma.exercise
          .findUnique({ where: { id: rawId } })
          .catch(() => null);
        if (!ex)
          ex = await prisma.exercise
            .findFirst({ where: { name: rawId } })
            .catch(() => null);
        if (!ex) {
          const staticEx = staticExercises.find(
            (s: any) => s.id === rawId || s.name === rawId,
          );
          if (staticEx) {
            const videoUrl =
              staticEx.videoUrl || process.env.VIDEO_URL_FALLBACK || "";
            try {
              ex = await prisma.exercise.create({
                data: {
                  name: staticEx.name,
                  description: staticEx.description ?? null,
                  videoUrl,
                  muscleGroup: staticEx.muscleGroup ?? null,
                  difficulty: staticEx.difficulty ?? null,
                  createdById: session.userId,
                },
              });
            } catch (e) {}
          }
        }

        if (!ex)
          return NextResponse.json(
            { error: `Exercise not found: ${rawId}` },
            { status: 400 },
          );

        wexs.push({
          exerciseId: ex.id,
          orderIndex: we.orderIndex ?? wi,
          sets: we.sets == null || we.sets === "" ? null : Number(we.sets),
          reps: we.reps == null || we.reps === "" ? null : String(we.reps),
          notes: we.notes ?? null,
        });
      }

      mappedDays.push({
        dayName,
        orderIndex,
        workoutExercises: { create: wexs },
      });
    }

    const updated = await prisma.workoutProgram.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        assignedToId: assignedToId ?? null,
        workoutDays: {
          // remove existing days/exercises and recreate
          deleteMany: {},
          create: mappedDays,
        },
      },
      include: {
        workoutDays: {
          include: { workoutExercises: { include: { exercise: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/v1/workouts/[id] error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Server error") },
      { status: 500 },
    );
  }
}
