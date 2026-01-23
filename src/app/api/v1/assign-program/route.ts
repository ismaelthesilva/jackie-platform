import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PT") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const { memberId, programId } = await req.json();
  if (!memberId || !programId) {
    return new Response(
      JSON.stringify({ error: "Missing memberId or programId" }),
      { status: 400 },
    );
  }
  // Assign the program to the member (assuming a relation table or array)
  try {
    await prisma.user.update({
      where: { id: memberId },
      data: {
        assignedPrograms: {
          connect: { id: programId },
        },
      },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
