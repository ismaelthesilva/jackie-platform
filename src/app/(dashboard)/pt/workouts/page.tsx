"use client";
import { useEffect, useState } from "react";
import WorkoutProgramCard from "@/components/workouts/WorkoutProgramCard";
import WorkoutForm from "@/components/workouts/WorkoutForm";
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

  const [exercises, setExercises] = useState<any[]>([]);
  const areaOptions = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Abs",
    "Glutes",
    "Full Body",
  ];

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
        <WorkoutForm
          exercises={exercises}
          areaOptions={areaOptions}
          onCreate={async (payload) => {
            await createProgram(payload);
            await fetchPrograms();
          }}
        />
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
