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
          include: { workoutExercises: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(programs);
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

    const program = await prisma.workoutProgram.create({
      data: {
        name,
        description: description ?? null,
        createdById: session.userId,
        assignedToId: assignedToId ?? null,
        workoutDays: {
          create: (Array.isArray(workoutDays) ? workoutDays : []).map(
            (d: any, di: number) => ({
              dayName: d.dayName ?? `Day ${di + 1}`,
              orderIndex: d.orderIndex ?? di,
              workoutExercises: {
                create: (Array.isArray(d.workoutExercises)
                  ? d.workoutExercises
                  : []
                ).map((we: any, wi: number) => ({
                  exerciseId: we.exerciseId,
                  orderIndex: we.orderIndex ?? wi,
                  // coerce sets to number or null
                  sets:
                    we.sets == null || we.sets === "" ? null : Number(we.sets),
                  // Prisma expects string|null for reps — ensure string
                  reps:
                    we.reps == null || we.reps === "" ? null : String(we.reps),
                  notes: we.notes ?? null,
                })),
              },
            }),
          ),
        },
      },
      include: {
        workoutDays: {
          include: { workoutExercises: true },
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "PT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params.id;
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
