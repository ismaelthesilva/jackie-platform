import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "PT")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("GET /api/v1/members error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Server error") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "PT")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "MEMBER" },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/members error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Server error") },
      { status: 500 },
    );
  }
}
