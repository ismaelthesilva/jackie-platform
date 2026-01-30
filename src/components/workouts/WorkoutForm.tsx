import { Combobox } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

export default function WorkoutForm({
  exercises,
  areaOptions,
  onCreate,
  initialData,
  onSubmit,
  submitLabel,
}: {
  exercises: any[];
  areaOptions: string[];
  onCreate?: (payload: any) => Promise<void>;
  initialData?: any;
  onSubmit?: (payload: any) => Promise<void>;
  submitLabel?: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDays, setWorkoutDays] = useState<any[]>([
    {
      dayName: "Day 1",
      area: "",
      exercises: [{ exerciseId: "", customId: "", sets: "", reps: "" }],
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [top40, setTop40] = useState<any[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState<string[]>([]); // one per day/exercise

  // Fetch Top 40 on mount
  useEffect(() => {
    fetch("/api/v1/exercises/top?limit=40")
      .then((r) => r.json())
      .then((data) => setTop40(data.exercises || []));
  }, []);

  // Initialize form when initialData is provided (edit mode)
  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name || "");
    setDescription(initialData.description || "");
    const days = (initialData.workoutDays || []).map((d: any) => ({
      dayName: d.dayName || "Day 1",
      area: d.area || "",
      exercises: (d.workoutExercises || []).map((we: any) => ({
        exerciseId: we.exerciseId || we.exercise?.id || "",
        customId: "",
        sets: we.sets == null ? "" : String(we.sets),
        reps: we.reps || "",
      })),
    }));
    setWorkoutDays(
      days.length
        ? days
        : [
            {
              dayName: "Day 1",
              area: "",
              exercises: [{ exerciseId: "", customId: "", sets: "", reps: "" }],
            },
          ],
    );
  }, [initialData]);

  // Child component for a single exercise row (separate component so hooks are stable)
  function ExerciseRow({
    dayIdx,
    idx,
    it,
  }: {
    dayIdx: number;
    idx: number;
    it: any;
  }) {
    const [query, setQuery] = useState("");

    const allOptions = [
      ...top40,
      ...exercises.filter(
        (ex) => !top40.some((t) => (t.id || t.name) === (ex.id || ex.name)),
      ),
    ];

    let selectedOption =
      allOptions.find((ex) => (ex.id || ex.name) === it.exerciseId) || null;

    // If no option matches but we have an exerciseId (from initialData),
    // create a lightweight placeholder so the Combobox shows the current value.
    if (!selectedOption && it.exerciseId) {
      selectedOption = { id: it.exerciseId, name: it.exerciseId } as any;
    }

    const filteredOptions =
      query === ""
        ? allOptions
        : allOptions.filter(
            (ex) =>
              ex.name?.toLowerCase().includes(query.toLowerCase()) ||
              ex.id?.toLowerCase().includes(query.toLowerCase()),
          );

    return (
      <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-1">
        <div className="col-span-5">
          <Combobox
            value={selectedOption}
            onChange={(val) => {
              const copy = [...workoutDays];
              copy[dayIdx].exercises[idx] = {
                ...copy[dayIdx].exercises[idx],
                exerciseId: val?.id || val?.name || "",
              };
              setWorkoutDays(copy);
            }}
          >
            <div className="relative">
              <Combobox.Input
                className="w-full p-2 border rounded"
                displayValue={(ex: any) => ex?.name || ""}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Select or search exercise"
              />
              <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                {filteredOptions.length === 0 && (
                  <div className="p-2 text-gray-500">No exercises found</div>
                )}
                {filteredOptions.map((ex: any) => (
                  <Combobox.Option
                    key={ex.id || ex.name}
                    value={ex}
                    as={Fragment}
                  >
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer select-none p-2 ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
                      >
                        {ex.name || ex.id}
                      </li>
                    )}
                  </Combobox.Option>
                ))}
                <Combobox.Option
                  value={{ id: "__custom__", name: "Custom id..." }}
                  as={Fragment}
                >
                  {({ active }) => (
                    <li
                      className={`cursor-pointer select-none p-2 ${active ? "bg-blue-100" : ""}`}
                    >
                      Custom id...
                    </li>
                  )}
                </Combobox.Option>
              </Combobox.Options>
            </div>
          </Combobox>
          {it.exerciseId === "__custom__" && (
            <input
              placeholder="Custom exercise id"
              value={it.customId}
              onChange={(e) => {
                const copy = [...workoutDays];
                copy[dayIdx].exercises[idx] = {
                  ...copy[dayIdx].exercises[idx],
                  customId: e.target.value,
                };
                setWorkoutDays(copy);
              }}
              className="w-full p-2 border rounded mt-1"
            />
          )}
        </div>
        <div className="col-span-2">
          <input
            placeholder="Sets"
            value={it.sets}
            onChange={(e) => {
              const copy = [...workoutDays];
              copy[dayIdx].exercises[idx] = {
                ...copy[dayIdx].exercises[idx],
                sets: e.target.value,
              };
              setWorkoutDays(copy);
            }}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="col-span-4">
          <input
            placeholder="Reps (e.g. 12 or 8-12)"
            value={it.reps}
            onChange={(e) => {
              const copy = [...workoutDays];
              copy[dayIdx].exercises[idx] = {
                ...copy[dayIdx].exercises[idx],
                reps: e.target.value,
              };
              setWorkoutDays(copy);
            }}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="col-span-1">
          <button
            type="button"
            onClick={() => {
              const copy = [...workoutDays];
              copy[dayIdx].exercises = copy[dayIdx].exercises.filter(
                (_: any, i: number) => i !== idx,
              );
              if (copy[dayIdx].exercises.length === 0) {
                copy[dayIdx].exercises = [
                  { exerciseId: "", customId: "", sets: "", reps: "" },
                ];
              }
              setWorkoutDays(copy);
            }}
            className="text-red-600"
            aria-label="Remove exercise"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  const buildPayload = () => {
    const days = workoutDays.map((day) => ({
      dayName: day.dayName,
      area: day.area,
      workoutExercises: day.exercises
        .map((it: any) => {
          const finalId =
            it.exerciseId === "__custom__" ? it.customId : it.exerciseId;
          return {
            exerciseId: finalId?.trim?.() || "",
            sets: it.sets === "" ? null : Number(it.sets),
            reps: it.reps || null,
          };
        })
        .filter((it: any) => it.exerciseId),
    }));
    return { name, description, workoutDays: days };
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = buildPayload();
    if (
      !payload.name ||
      payload.workoutDays.some((d: any) => d.workoutExercises.length === 0)
    ) {
      setError(
        "Program name and at least one valid exercise per day are required",
      );
      return;
    }
    setError(null);
    const submit = onSubmit || onCreate;
    if (!submit) return;
    await submit(payload);

    // If we're calling onCreate (create mode), reset form. If editing (initialData provided), keep values.
    if (!initialData && onCreate) {
      setName("");
      setDescription("");
      setWorkoutDays([
        {
          dayName: "Day 1",
          area: "",
          exercises: [{ exerciseId: "", customId: "", sets: "", reps: "" }],
        },
      ]);
    }
  };

  return (
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
        <span className="text-sm">Days & Exercises</span>
        {workoutDays.map((day, dayIdx) => (
          <div key={dayIdx} className="border rounded p-2 mb-2 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={day.dayName}
                onChange={(e) => {
                  const copy = [...workoutDays];
                  copy[dayIdx].dayName = e.target.value;
                  setWorkoutDays(copy);
                }}
                className="p-2 border rounded flex-1"
                placeholder={`Day ${dayIdx + 1} name`}
              />
              <select
                value={day.area || ""}
                onChange={(e) => {
                  const copy = [...workoutDays];
                  copy[dayIdx].area = e.target.value;
                  setWorkoutDays(copy);
                }}
                className="p-2 border rounded"
              >
                <option value="">Select area</option>
                {areaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {workoutDays.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setWorkoutDays(
                      workoutDays.filter((_: any, i: number) => i !== dayIdx),
                    )
                  }
                  className="text-red-600 text-xs"
                >
                  Remove Day
                </button>
              )}
            </div>
            {day.exercises.map((it: any, idx: number) => (
              <ExerciseRow key={idx} dayIdx={dayIdx} idx={idx} it={it} />
            ))}
            <div>
              <button
                type="button"
                onClick={() => {
                  const copy = [...workoutDays];
                  copy[dayIdx].exercises.push({
                    exerciseId: "",
                    customId: "",
                    sets: "",
                    reps: "",
                  });
                  setWorkoutDays(copy);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded mt-1"
              >
                Add exercise
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setWorkoutDays([
              ...workoutDays,
              {
                dayName: `Day ${workoutDays.length + 1}`,
                area: "",
                exercises: [
                  { exerciseId: "", customId: "", sets: "", reps: "" },
                ],
              },
            ])
          }
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded mt-2"
        >
          Add Day
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
        >
          {submitLabel || (initialData ? "Update program" : "Create program")}
        </button>
        {!initialData && (
          <button
            type="button"
            onClick={() => {
              setName("");
              setDescription("");
              setWorkoutDays([
                {
                  dayName: "Day 1",
                  area: "",
                  exercises: [
                    { exerciseId: "", customId: "", sets: "", reps: "" },
                  ],
                },
              ]);
              setError(null);
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
          >
            Reset
          </button>
        )}
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}
