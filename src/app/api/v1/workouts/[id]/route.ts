import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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
