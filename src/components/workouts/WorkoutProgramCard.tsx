import ImageMotion from "@/components/exercises/ImageMotion";

import { useState, useEffect } from "react";

export default function WorkoutProgramCard({
  program,
  exercises,
  onUpdate,
  onDelete,
  members,
}: {
  program: any;
  exercises: any[];
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  members: { id: string; name: string; email: string }[];
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
      .map((it: { exerciseId: string; customId: string; sets: string | number; reps: string }) => {
        const finalId =
          it.exerciseId === "__custom__" ? it.customId : it.exerciseId;
        return {
          exerciseId: finalId?.trim?.() || "",
          sets: it.sets === "" ? null : Number(it.sets),
          reps: it.reps || null,
        };
      })
      .filter((it: { exerciseId: string; customId: string; sets: string | number; reps: string }) => it.exerciseId);
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

  return (
    <div className="p-4 border rounded relative">
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            placeholder="Program name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="space-y-2">
            <span className="text-sm">Exercises</span>
            {exercisesList.map((it: { exerciseId: string; customId: string; sets: string | number; reps: string }, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={it.exerciseId}
                    onChange={(e) => {
                      const copy = [...exercisesList];
                      copy[idx] = { ...copy[idx], exerciseId: e.target.value };
                      setExercisesList(copy);
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">-- select exercise --</option>
                    {exercises.map((ex: any) => (
                      <option key={ex.id || ex.name} value={ex.id || ex.name}>
                        {ex.name || ex.id}
                      </option>
                    ))}
                    <option value="__custom__">Custom id...</option>
                  </select>
                  {it.exerciseId === "__custom__" && (
                    <input
                      placeholder="Custom exercise id"
                      value={it.customId}
                      onChange={(e) => {
                        const copy = [...exercisesList];
                        copy[idx] = { ...copy[idx], customId: e.target.value };
                        setExercisesList(copy);
                      }}
                      className="w-full p-2 border rounded mt-1"
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    placeholder="Sets"
                    value={it.sets as any}
                    onChange={(e) => {
                      const copy = [...exercisesList];
                      copy[idx] = {
                        ...copy[idx],
                        sets:
                          e.target.value === "" ? "" : Number(e.target.value),
                      };
                      setExercisesList(copy);
                    }}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    placeholder="Reps (e.g. 12 or 8-12)"
                    value={it.reps}
                    onChange={(e) => {
                      const copy = [...exercisesList];
                      copy[idx] = { ...copy[idx], reps: e.target.value };
                      setExercisesList(copy);
                    }}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => {
                      const copy = exercisesList.filter((_: any, i: number) => i !== idx);
                      setExercisesList(
                        copy.length
                          ? copy
                          : [
                              {
                                exerciseId: "",
                                customId: "",
                                sets: "",
                                reps: "",
                              },
                            ],
                      );
                    }}
                    className="text-red-600"
                    aria-label="Remove exercise"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() =>
                  setExercisesList([
                    ...exercisesList,
                    { exerciseId: "", customId: "", sets: "", reps: "" },
                  ])
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded"
              >
                Add exercise
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              Update program
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      ) : (
        <>
          <h3 className="font-bold">{program.name}</h3>
          <p className="text-sm text-gray-600">{program.description}</p>
          <div className="mt-2 space-y-2">
            {program.workoutDays.map((d: any) => (
              <div key={d.id}>
                <div className="font-medium">{d.dayName}</div>
                {d.workoutExercises.map((we: any) => {
                  const ex = we.exercise ?? null;
                  const images = ex?.images ?? [];

                  return (
                    <div key={we.id} className="flex gap-3 items-start">
                      <div className="w-36">
                        <ImageMotion
                          images={images}
                          videoUrl={ex?.videoUrl}
                          alt={ex?.name ?? we.exerciseId}
                        />
                      </div>
                      <div>
                        <div>{ex?.name ?? we.exerciseId}</div>
                        <div className="text-sm text-gray-600">
                          {we.sets ?? ""} x {we.reps ?? ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-2 items-center">
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 text-sm"
                aria-label={`Edit ${program.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(program.id)}
                className="text-red-600 text-sm"
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
function AssignProgramToMember({ programId, members }: { programId: string; members: { id: string; name: string; email: string }[] }) {
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
        onChange={e => setSelected(e.target.value)}
        className="border rounded p-1 text-sm"
      >
        <option value="">Assign to member…</option>
        {members.map(m => (
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
