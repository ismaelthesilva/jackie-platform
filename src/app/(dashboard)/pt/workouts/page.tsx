"use client";
import { useEffect, useState } from "react";
import WorkoutProgramCard from "@/components/workouts/WorkoutProgramCard";
import {
  createProgram,
  deleteProgram,
  updateProgram,
} from "@/lib/workoutClient";

export default function WorkoutsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  // form state for creating a program
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesList, setExercisesList] = useState<
    { exerciseId: string; customId?: string; sets: number | ""; reps: string }[]
  >([{ exerciseId: "", customId: "", sets: "", reps: "" }]);
  // Remove editId and related state

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/workouts", { credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Status ${res.status}`);
      setPrograms(body);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchExercises();
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/v1/members", { credentials: "include" });
      const body = await res.json().catch(() => ({}));
      // Support both { members: [...] } and [...]
      if (Array.isArray(body)) {
        setMembers(body);
      } else if (Array.isArray(body.members)) {
        setMembers(body.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      setMembers([]);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch("/api/v1/exercises", { credentials: "include" });
      const body = await res.json().catch(() => ({}));
      const list = body?.exercises ?? body ?? [];
      setExercises(Array.isArray(list) ? list : []);
    } catch (err) {
      setExercises([]);
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // validate exercisesList
    const workoutExercises = exercisesList
      .map((it) => {
        const finalId =
          it.exerciseId === "__custom__" ? it.customId : it.exerciseId;
        return {
          exerciseId: finalId?.trim?.() || "",
          sets: it.sets === "" ? null : Number(it.sets),
          reps: it.reps || null,
        };
      })
      .filter((it) => it.exerciseId);

    if (!name || workoutExercises.length === 0) {
      setError("Program name and at least one valid exercise are required");
      return;
    }

    setError(null);
    try {
      const payload = {
        name,
        description,
        workoutDays: [
          {
            dayName: "Day 1",
            workoutExercises,
          },
        ],
      };
      await createProgram(payload);
      setName("");
      setDescription("");
      setExercisesList([{ exerciseId: "", customId: "", sets: "", reps: "" }]);
      await fetchPrograms();
    } catch (err: any) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProgram(id);
      setPrograms((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(String(err));
    }
  };

  if (loading) return <div className="p-4">Loading workout programs…</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2">Create Workout Program (PT)</h3>
        <form onSubmit={handleCreate} className="space-y-2">
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
            {exercisesList.map((it, idx) => (
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
                      const copy = exercisesList.filter((_, i) => i !== idx);
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              Create program
            </button>
            <button
              type="button"
              onClick={() => {
                setName("");
                setDescription("");
                setExercisesList([
                  { exerciseId: "", customId: "", sets: "", reps: "" },
                ]);
                setError(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && <div className="p-4 text-red-600">Error: {error}</div>}

      {programs.length === 0 ? (
        <div>No workout programs found.</div>
      ) : (
        <div className="space-y-4">
          {programs.map((p) => (
            <WorkoutProgramCard
              key={p.id}
              program={p}
              exercises={exercises}
              members={members}
              onUpdate={async (id, data) => {
                await updateProgram(id, data);
                await fetchPrograms();
              }}
              onDelete={async (id) => {
                await handleDelete(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
