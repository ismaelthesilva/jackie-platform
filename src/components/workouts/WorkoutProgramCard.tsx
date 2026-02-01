import ImageMotion from "@/components/exercises/ImageMotion";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Info, ChevronUp } from "lucide-react";

import { useState, useEffect } from "react";

export default function WorkoutProgramCard({
  program,
  exercises,
  onUpdate,
  onDelete,
  members,
  areaOptions = [],
}: {
  program: any;
  exercises: any[];
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  members: { id: string; name: string; email: string }[];
  areaOptions?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(program.name || "");
  const [description, setDescription] = useState(program.description || "");
  const [exercisesList, setExercisesList] = useState(
    (program.workoutDays?.[0]?.workoutExercises || []).map((we: any) => ({
      exerciseId: we.exerciseId,
      customId: "",
      sets: we.sets ?? "",
      reps: we.reps ?? "",
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<
    Record<string, boolean>
  >({});

  // Add at least one row if empty (fix: useEffect, not in render)
  useEffect(() => {
    if (!editing && exercisesList.length === 0) {
      setExercisesList([{ exerciseId: "", customId: "", sets: "", reps: "" }]);
    }
    // Only run when editing or exercisesList.length changes
    // eslint-disable-next-line
  }, [editing, exercisesList.length]);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setName(program.name || "");
    setDescription(program.description || "");
    setExercisesList(
      (program.workoutDays?.[0]?.workoutExercises || []).map((we: any) => ({
        exerciseId: we.exerciseId,
        customId: "",
        sets: we.sets ?? "",
        reps: we.reps ?? "",
      })),
    );
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const workoutExercises = exercisesList
      .map(
        (it: {
          exerciseId: string;
          customId: string;
          sets: string | number;
          reps: string;
        }) => {
          const finalId =
            it.exerciseId === "__custom__" ? it.customId : it.exerciseId;
          return {
            exerciseId: finalId?.trim?.() || "",
            sets: it.sets === "" ? null : Number(it.sets),
            reps: it.reps || null,
          };
        },
      )
      .filter(
        (it: {
          exerciseId: string;
          customId: string;
          sets: string | number;
          reps: string;
        }) => it.exerciseId,
      );
    if (!name || workoutExercises.length === 0) {
      setError("Program name and at least one valid exercise are required");
      return;
    }
    setError(null);
    await onUpdate(program.id, {
      name,
      description,
      workoutDays: [
        {
          dayName: "Day 1",
          workoutExercises,
        },
      ],
    });
    setEditing(false);
  };

  const handleUpdate = async (payload: any) => {
    setError(null);
    try {
      await onUpdate(program.id, payload);
      setEditing(false);
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
  };

  const toggleInstructions = (exerciseId: string) => {
    setShowInstructions((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-green-50 text-green-700 border-green-200",
    intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    advanced: "bg-red-50 text-red-700 border-red-200",
    expert: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className="space-y-4">
      {editing ? (
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <WorkoutForm
              areaOptions={areaOptions}
              initialData={program}
              onSubmit={handleUpdate}
              submitLabel="Update program"
            />
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                variant="destructive"
              >
                Cancel
              </Button>
            </div>
            {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
          </CardContent>
        </Card>
      ) : (
        <Card className="hover:shadow-lg transition-shadow">
          {/* Program Header */}
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl mb-2">{program.name}</CardTitle>
            {program.description && (
              <p className="text-sm text-gray-600">{program.description}</p>
            )}

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Program
              </Button>
              <Button
                onClick={() => onDelete(program.id)}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Program
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {/* Each Day with Exercises */}
            {program.workoutDays && program.workoutDays.length > 0 ? (
              <div className="space-y-6">
                {program.workoutDays.map((d: any, dayIndex: number) => (
                  <div key={d.id} className="space-y-3">
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-800">
                          {d.dayName}
                        </h3>
                        {d.area && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {d.area}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {d.workoutExercises?.length || 0} exercises
                      </Badge>
                    </div>

                    {/* Exercise List */}
                    {d.workoutExercises && d.workoutExercises.length > 0 ? (
                      <div className="space-y-3">
                        {d.workoutExercises.map(
                          (we: any, exerciseIndex: number) => {
                            const ex = we.exercise ?? null;
                            const images = ex?.images ?? [];
                            const exerciseKey = `${d.id}-${we.id}`;

                            return (
                              <div
                                key={we.id}
                                className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex gap-3">
                                  {/* Exercise Image - Fixed Size */}
                                  <div className="flex-shrink-0">
                                    {ex && (
                                      <div className="w-24 h-20 rounded overflow-hidden bg-gray-100">
                                        <ImageMotion
                                          images={images}
                                          alt={ex?.name ?? we.exerciseId}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Exercise Info - Flexible */}
                                  <div className="flex-1 min-w-0">
                                    {/* Exercise Name & Sets/Reps */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-semibold text-sm leading-tight">
                                        {ex?.name ?? we.exerciseId}
                                      </h4>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <Badge
                                          variant="outline"
                                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                                        >
                                          {we.sets ?? "-"}×{we.reps ?? "-"}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Badges Row */}
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                      {ex?.level && (
                                        <Badge
                                          className={
                                            levelColors[
                                              ex.level.toLowerCase()
                                            ] || "border"
                                          }
                                          variant="outline"
                                        >
                                          {ex.level}
                                        </Badge>
                                      )}

                                      {ex?.muscleGroup && (
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                        >
                                          🎯 {ex.muscleGroup}
                                        </Badge>
                                      )}

                                      {/* Instructions Button */}
                                      {ex?.instructions &&
                                        ex.instructions.length > 0 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() =>
                                              toggleInstructions(exerciseKey)
                                            }
                                          >
                                            {showInstructions[exerciseKey] ? (
                                              <>
                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                Hide
                                              </>
                                            ) : (
                                              <>
                                                <Info className="h-3 w-3 mr-1" />
                                                Info
                                              </>
                                            )}
                                          </Button>
                                        )}
                                    </div>

                                    {/* Instructions Content */}
                                    {showInstructions[exerciseKey] &&
                                      ex?.instructions &&
                                      ex.instructions.length > 0 && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                            {ex.instructions.map(
                                              (
                                                instruction: string,
                                                index: number,
                                              ) => (
                                                <li
                                                  key={index}
                                                  className="leading-snug"
                                                >
                                                  {instruction}
                                                </li>
                                              ),
                                            )}
                                          </ol>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No exercises in this day
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No workout days configured
              </p>
            )}

            {/* Assign to Member Section - Always at bottom */}
            <div className="mt-6 pt-4 border-t">
              <AssignProgramToMember programId={program.id} members={members} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Inline component for assignment UI
function AssignProgramToMember({
  programId,
  members,
}: {
  programId: string;
  members: { id: string; name: string; email: string }[];
}) {
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleAssign = async () => {
    if (!selected) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/v1/assign-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selected, programId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed");
      setStatus("Assigned!");
    } catch (err: any) {
      setStatus(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      >
        <option value="">Assign to member…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.email})
          </option>
        ))}
      </select>
      <Button
        onClick={handleAssign}
        disabled={!selected || loading}
        size="sm"
        className="w-full"
      >
        Assign Program
      </Button>
      {status && (
        <span className="text-xs text-center text-gray-600">{status}</span>
      )}
    </div>
  );
}
