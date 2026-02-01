"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ImageMotion from "@/components/exercises/ImageMotion";

interface Exercise {
  id: string;
  name: string;
  images?: string[];
}

interface WorkoutExercise {
  id: string;
  sets: number | null;
  reps: string | null;
  notes?: string | null;
  exercise: Exercise;
}

interface WorkoutDay {
  id: string;
  dayName: string;
  area?: string | null;
  workoutExercises: WorkoutExercise[];
}

interface Program {
  id: string;
  name: string;
  description?: string | null;
  workoutDays: WorkoutDay[];
}

export default function ClientWorkoutList({
  assignedPrograms,
}: {
  assignedPrograms: Program[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Assigned Programs
          <Badge variant="outline">{assignedPrograms.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignedPrograms.length === 0 ? (
          <div className="text-sm text-gray-500">No programs assigned.</div>
        ) : (
          <Tabs defaultValue={assignedPrograms[0]?.id} className="w-full">
            <TabsList className="mb-4">
              {assignedPrograms.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="capitalize">
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {assignedPrograms.map((p) => (
              <TabsContent key={p.id} value={p.id}>
                <div className="mb-2">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {p.name}
                    <Badge variant="secondary">Program</Badge>
                  </div>
                  {p.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {p.description}
                    </div>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="space-y-6">
                  {p.workoutDays.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      No workout days assigned.
                    </div>
                  ) : (
                    p.workoutDays.map((d) => (
                      <Card key={d.id} className="mb-4 bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {d.dayName}
                            {d.area && (
                              <Badge variant="outline">{d.area}</Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {d.workoutExercises.length === 0 ? (
                            <div className="text-sm text-gray-400">
                              No exercises assigned.
                            </div>
                          ) : (
                            <ul className="space-y-4">
                              {d.workoutExercises.map((we) => {
                                const images = we.exercise?.images || [];
                                return (
                                  <li
                                    key={we.id}
                                    className="flex flex-row gap-4 items-center"
                                  >
                                    <div className="w-20 sm:w-40 md:w-48 lg:w-56 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 ring-1 ring-border transition-transform hover:scale-105 h-20 sm:h-24 md:h-28 lg:h-32">
                                      <ImageMotion
                                        images={images}
                                        alt={we.exercise?.name || "Exercise"}
                                        className="w-full h-full"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-sm">
                                        {we.exercise?.name}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {we.sets ?? "-"} sets
                                        </Badge>
                                        <Badge
                                          variant="default"
                                          className="text-xs"
                                        >
                                          {we.reps ?? "-"} reps
                                        </Badge>
                                      </div>
                                      {we.notes && (
                                        <div className="text-xs italic text-gray-500 mt-1">
                                          {we.notes}
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
