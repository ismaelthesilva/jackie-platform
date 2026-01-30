import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

import Link from "next/link";
import { getAllExercises } from "@/lib/exercises";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MemberWorkoutList from "@/components/workouts/MemberWorkoutList";

export default async function MemberMePage() {
  const session = await getSession();
  if (!session)
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Not authenticated</CardTitle>
            <CardDescription>Please sign in to continue.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  // PTs should view the members listing instead
  if (session.role === "PT") {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Card className="max-w-md w-full border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">
              PTs should use the members list.
            </CardTitle>
            <CardDescription>
              <Link href="/members" className="text-blue-600 underline">
                Go to members
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
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

  if (!member)
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Member not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );

  // attach static images from public/exercises to each exercise if available
  const staticExercises = getAllExercises();
  const programsWithImages = (member.assignedPrograms || []).map((p: any) => {
    const days = (p.workoutDays || []).map((d: any) => {
      const wexs = (d.workoutExercises || []).map((we: any) => {
        const ex = we.exercise ?? null;
        const staticEx = staticExercises.find(
          (s: any) => s.id === ex?.id || s.name === ex?.name,
        );
        const images = (staticEx?.images || []).map((img: string) =>
          img.startsWith("/") ? img : `/exercises/${img}`,
        );
        return { ...we, exercise: { ...(ex ?? {}), images } };
      });
      return { ...d, workoutExercises: wexs };
    });
    return { ...p, workoutDays: days };
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                {member.name}
                <Badge variant="secondary">Member</Badge>
              </CardTitle>
              <CardDescription>{member.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Render the client component directly; it includes its own Card/header */}
      <MemberWorkoutList
        assignedPrograms={
          Array.isArray(programsWithImages) ? programsWithImages : []
        }
      />
    </div>
  );
}
