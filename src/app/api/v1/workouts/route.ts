import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getAllExercises } from "@/lib/exercises";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const programs = await prisma.workoutProgram.findMany({
      where: { createdById: session.userId },
      include: {
        workoutDays: {
          include: { workoutExercises: { include: { exercise: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    // attach static images from public/exercises to each exercise if available
    const staticExercises = getAllExercises();
    const mapped = programs.map((p: any) => {
      const days = (p.workoutDays || []).map((d: any) => {
        const wexs = (d.workoutExercises || []).map((we: any) => {
          const ex = we.exercise ?? null;
          const staticEx = staticExercises.find(
            (s: any) => s.id === ex?.id || s.name === ex?.name,
          );
          const images = (staticEx?.images || []).map((p: string) =>
            p.startsWith("/") ? p : `/exercises/${p}`,
          );
          return { ...we, exercise: { ...(ex ?? {}), images } };
        });
        return { ...d, workoutExercises: wexs };
      });
      return { ...p, workoutDays: days };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error(
      "GET /api/v1/workouts error:",
      err && err.stack ? err.stack : err,
    );
    return NextResponse.json(
      { error: String(err?.message ?? err ?? "Internal server error") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "PT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, description, assignedToId, workoutDays } = body;

    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });

    // Load static exercises (from public/exercises)
    const staticExercises = getAllExercises();

    // Map workoutDays/workoutExercises and ensure referenced exercises exist in DB.
    const mappedDays = [] as any[];

    for (
      let di = 0;
      Array.isArray(workoutDays) && di < workoutDays.length;
      di++
    ) {
      const d = workoutDays[di];
      const dayName = d.dayName ?? `Day ${di + 1}`;
      const orderIndex = d.orderIndex ?? di;
      const area = d.area ?? null;

      const wexs = [] as any[];
      const list = Array.isArray(d.workoutExercises) ? d.workoutExercises : [];
      for (let wi = 0; wi < list.length; wi++) {
        const we = list[wi];
        let rawId = we.exerciseId;
        if (typeof rawId === "string") rawId = rawId.trim();
        const rawIdLower =
          typeof rawId === "string" ? rawId.toLowerCase() : rawId;
        if (!rawId) continue;

        // Try to find exercise by id in DB
        let ex = await prisma.exercise
          .findUnique({ where: { id: rawId } })
          .catch(() => null);

        // If not found by id, try case-insensitive name match in DB
        if (!ex) {
          ex = await prisma.exercise
            .findFirst({
              where: { name: { equals: rawId, mode: "insensitive" } },
            })
            .catch(() => null);
        }

        // If still not found, try to create from static exercises (match by id or name)
        if (!ex) {
          const staticEx = staticExercises.find((s: any) => {
            if (!s) return false;
            const sid = String(s.id || "")
              .trim()
              .toLowerCase();
            const sname = String(s.name || "")
              .trim()
              .toLowerCase();
            return sid === rawIdLower || sname === rawIdLower;
          });
          if (staticEx) {
            // Try to find by name and createdById (avoid duplicate creation)
            ex = await prisma.exercise
              .findFirst({
                where: {
                  name: staticEx.name,
                  createdById: session.userId,
                },
              })
              .catch(() => null);
            if (!ex) {
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
              } catch (e) {
                // ignore and leave ex null — will error below
              }
            }
          }
        }

        if (!ex) {
          return NextResponse.json(
            { error: `Exercise not found: ${rawId}` },
            { status: 400 },
          );
        }

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
        area,
        workoutExercises: { create: wexs },
      });
    }

    const program = await prisma.workoutProgram.create({
      data: {
        name,
        description: description ?? null,
        createdById: session.userId,
        assignedToId: assignedToId ?? null,
        workoutDays: { create: mappedDays },
      },
      include: {
        workoutDays: {
          include: { workoutExercises: { include: { exercise: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/workouts error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Server error") },
      { status: 500 },
    );
  }
}

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
