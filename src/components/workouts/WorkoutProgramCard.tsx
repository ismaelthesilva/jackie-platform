import ImageMotion from "@/components/exercises/ImageMotion";
import WorkoutForm from "@/components/workouts/WorkoutForm";

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

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col justify-between h-full p-4 border border-gray-100">
      {editing ? (
        <div>
          <WorkoutForm
            exercises={exercises}
            areaOptions={areaOptions}
            initialData={program}
            onSubmit={handleUpdate}
            submitLabel="Update program"
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      ) : (
        <>
          <h3 className="font-bold text-lg mb-1 truncate">{program.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {program.description}
          </p>
          <div className="mt-2 space-y-2">
            {program.workoutDays.map((d: any, i: number) => (
              <div key={d.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-xs text-gray-700">
                    {d.dayName}
                    {d.area ? ` - ${d.area}` : ""}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {d.workoutExercises.map((we: any) => {
                    const ex = we.exercise ?? null;
                    const images = ex?.images ?? [];
                    return (
                      <div key={we.id} className="flex gap-3 items-center">
                        <div className="w-20 h-16 flex-shrink-0">
                          <ImageMotion
                            images={images}
                            alt={ex?.name ?? we.exerciseId}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium text-sm">
                            {ex?.name ?? we.exerciseId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {we.sets ?? ""} x {we.reps ?? ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-3 items-center">
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 text-xs font-semibold"
                aria-label={`Edit ${program.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(program.id)}
                className="text-red-600 text-xs font-semibold"
                aria-label={`Delete ${program.name}`}
              >
                Delete
              </button>
            </div>
            <AssignProgramToMember programId={program.id} members={members} />
          </div>
        </>
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
    <div className="flex gap-2 items-center mt-2 md:mt-0">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded p-1 text-sm"
      >
        <option value="">Assign to member…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.email})
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={!selected || loading}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
      >
        Assign
      </button>
      {status && <span className="text-xs ml-2">{status}</span>}
    </div>
  );
}
