import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function MemberMePage() {
  const session = await getSession();
  if (!session) return <div className="p-6">Not authenticated</div>;

  // PTs should view the members listing instead
  if (session.role === "PT") {
    return (
      <div className="p-6">
        <p className="text-red-600">PTs should use the members list.</p>
        <div className="pt-4">
          <Link href="/members">Go to members</Link>
        </div>
      </div>
    );
  }

  const member = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      assignedPrograms: {
        select: {
          id: true,
          name: true,
          description: true,
          workoutDays: {
            select: {
              id: true,
              dayName: true,
              orderIndex: true,
              workoutExercises: {
                select: {
                  id: true,
                  sets: true,
                  reps: true,
                  notes: true,
                  exercise: { select: { id: true, name: true } },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!member) return <div className="p-6">Member not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{member.name}</h2>
        <div className="text-sm text-gray-600">{member.email}</div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Assigned Programs</h3>
        {member.assignedPrograms.length === 0 && (
          <div className="text-sm text-gray-500">No programs assigned.</div>
        )}
        <div className="space-y-4 pt-2">
          {member.assignedPrograms.map((p) => (
            <div key={p.id} className="border p-3 rounded">
              <div className="font-semibold">{p.name}</div>
              {p.description && (
                <div className="text-sm text-gray-600">{p.description}</div>
              )}
              <div className="mt-2 space-y-2">
                {p.workoutDays.map((d) => (
                  <div key={d.id}>
                    <div className="text-sm font-medium">{d.dayName}</div>
                    <ul className="ml-4 list-disc text-sm text-gray-700">
                      {d.workoutExercises.map((we) => (
                        <li key={we.id}>
                          {we.exercise.name} — {we.sets ?? ""} sets{" "}
                          {we.reps ?? ""} {we.notes ? `(${we.notes})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
