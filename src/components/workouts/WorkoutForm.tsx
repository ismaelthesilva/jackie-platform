"use client";

import { useState, useEffect } from "react";
import { GripVertical, Trash2, Plus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseSelector, Exercise } from "./ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  sets: string;
  reps: string;
}

interface WorkoutDay {
  id: string;
  dayName: string;
  area: string;
  exercises: WorkoutExercise[];
}

interface WorkoutFormProps {
  exercises?: any[];
  areaOptions: string[];
  onCreate?: (payload: any) => Promise<void>;
  initialData?: any;
  onSubmit?: (payload: any) => Promise<void>;
  submitLabel?: string;
}

// Sortable Exercise Row Component
function SortableExerciseRow({
  exercise,
  dayId,
  onUpdate,
  onRemove,
}: {
  exercise: WorkoutExercise;
  dayId: string;
  onUpdate: (exerciseId: string, field: string, value: any) => void;
  onRemove: (exerciseId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 p-3 bg-background border rounded-lg hover:border-primary/50 transition-colors"
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Exercise Selector */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-6">
          <Label className="text-xs text-muted-foreground">Exercise</Label>
          <ExerciseSelector
            value={
              exercise.exerciseId && exercise.exerciseName
                ? ({
                    id: exercise.exerciseId,
                    name: exercise.exerciseName,
                  } as Exercise)
                : null
            }
            onSelect={(selectedExercise) => {
              onUpdate(exercise.id, "exerciseId", selectedExercise.id);
              onUpdate(exercise.id, "exerciseName", selectedExercise.name);
            }}
            placeholder="Select exercise..."
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground">Sets</Label>
          <Input
            type="text"
            placeholder="e.g., 4"
            value={exercise.sets}
            onChange={(e) => onUpdate(exercise.id, "sets", e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <Label className="text-xs text-muted-foreground">Reps</Label>
          <Input
            type="text"
            placeholder="e.g., 10 or 8-12"
            value={exercise.reps}
            onChange={(e) => onUpdate(exercise.id, "reps", e.target.value)}
          />
        </div>

        <div className="md:col-span-1 flex items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(exercise.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Day Card Component
function DayCard({
  day,
  dayIndex,
  areaOptions,
  onUpdateDay,
  onRemoveDay,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
  isOnlyDay,
}: {
  day: WorkoutDay;
  dayIndex: number;
  areaOptions: string[];
  onUpdateDay: (dayId: string, field: string, value: any) => void;
  onRemoveDay: (dayId: string) => void;
  onAddExercise: (dayId: string) => void;
  onUpdateExercise: (
    dayId: string,
    exerciseId: string,
    field: string,
    value: any,
  ) => void;
  onRemoveExercise: (dayId: string, exerciseId: string) => void;
  onReorderExercises: (
    dayId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  isOnlyDay: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = day.exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = day.exercises.findIndex((ex) => ex.id === over.id);
      onReorderExercises(day.id, oldIndex, newIndex);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Input
            value={day.dayName}
            onChange={(e) => onUpdateDay(day.id, "dayName", e.target.value)}
            className="flex-1 font-semibold"
            placeholder={`Day ${dayIndex + 1} name`}
          />
          <Select
            value={day.area}
            onValueChange={(value) => onUpdateDay(day.id, "area", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {areaOptions.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isOnlyDay && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveDay(day.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {day.area && (
          <Badge variant="secondary" className="w-fit">
            {day.area}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={day.exercises.map((ex) => ex.id)}
            strategy={verticalListSortingStrategy}
          >
            {day.exercises.map((exercise) => (
              <SortableExerciseRow
                key={exercise.id}
                exercise={exercise}
                dayId={day.id}
                onUpdate={(exerciseId, field, value) =>
                  onUpdateExercise(day.id, exerciseId, field, value)
                }
                onRemove={(exerciseId) => onRemoveExercise(day.id, exerciseId)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddExercise(day.id)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WorkoutForm({
  areaOptions,
  onCreate,
  initialData,
  onSubmit,
  submitLabel,
}: WorkoutFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    {
      id: crypto.randomUUID(),
      dayName: "Day 1",
      area: "",
      exercises: [],
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("0");

  // Initialize form when initialData is provided (edit mode)
  useEffect(() => {
    if (!initialData) return;

    setName(initialData.name || "");
    setDescription(initialData.description || "");

    const days: WorkoutDay[] = (initialData.workoutDays || []).map(
      (d: any) => ({
        id: d.id || crypto.randomUUID(),
        dayName: d.dayName || "Day 1",
        area: d.area || "",
        exercises: (d.workoutExercises || []).map((we: any) => ({
          id: we.id || crypto.randomUUID(),
          exerciseId: we.exerciseId || we.exercise?.id || "",
          exerciseName: we.exercise?.name || "",
          sets: we.sets == null ? "" : String(we.sets),
          reps: we.reps || "",
        })),
      }),
    );

    setWorkoutDays(
      days.length > 0
        ? days
        : [
            {
              id: crypto.randomUUID(),
              dayName: "Day 1",
              area: "",
              exercises: [],
            },
          ],
    );
  }, [initialData]);

  // Day Management
  const addDay = () => {
    const newDay: WorkoutDay = {
      id: crypto.randomUUID(),
      dayName: `Day ${workoutDays.length + 1}`,
      area: "",
      exercises: [],
    };
    setWorkoutDays([...workoutDays, newDay]);
    setActiveTab(String(workoutDays.length));
  };

  const removeDay = (dayId: string) => {
    const filtered = workoutDays.filter((d) => d.id !== dayId);
    setWorkoutDays(filtered);
    if (activeTab === String(workoutDays.findIndex((d) => d.id === dayId))) {
      setActiveTab("0");
    }
  };

  const updateDay = (dayId: string, field: string, value: any) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId ? { ...day, [field]: value } : day,
      ),
    );
  };

  // Exercise Management
  const addExercise = (dayId: string) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  id: crypto.randomUUID(),
                  exerciseId: "",
                  exerciseName: "",
                  sets: "",
                  reps: "",
                },
              ],
            }
          : day,
      ),
    );
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : day,
      ),
    );
  };

  const updateExercise = (
    dayId: string,
    exerciseId: string,
    field: string,
    value: any,
  ) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex,
              ),
            }
          : day,
      ),
    );
  };

  const reorderExercises = (
    dayId: string,
    oldIndex: number,
    newIndex: number,
  ) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: arrayMove(day.exercises, oldIndex, newIndex),
            }
          : day,
      ),
    );
  };

  // Form Submission
  const buildPayload = () => {
    const days = workoutDays.map((day) => ({
      dayName: day.dayName,
      area: day.area,
      workoutExercises: day.exercises
        .filter((ex) => ex.exerciseId)
        .map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets === "" ? null : Number(ex.sets),
          reps: ex.reps || null,
        })),
    }));
    return { name, description, workoutDays: days };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();

    if (!payload.name.trim()) {
      setError("Program name is required");
      return;
    }

    if (payload.workoutDays.some((d: any) => d.workoutExercises.length === 0)) {
      setError("Each day must have at least one exercise");
      return;
    }

    setError(null);
    const submit = onSubmit || onCreate;
    if (!submit) return;

    try {
      await submit(payload);

      // Reset form only in create mode
      if (!initialData && onCreate) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save workout");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setWorkoutDays([
      {
        id: crypto.randomUUID(),
        dayName: "Day 1",
        area: "",
        exercises: [],
      },
    ]);
    setError(null);
    setActiveTab("0");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">Program Name *</Label>
            <Input
              id="program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body Strength"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program-description">Description</Label>
            <Textarea
              id="program-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the workout program..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workout Days</CardTitle>
          <Button type="button" onClick={addDay} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile: Tabs */}
          <div className="block md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${workoutDays.length}, minmax(0, 1fr))`,
                }}
              >
                {workoutDays.map((day, idx) => (
                  <TabsTrigger key={day.id} value={String(idx)}>
                    {day.dayName || `Day ${idx + 1}`}
                  </TabsTrigger>
                ))}
              </TabsList>
              {workoutDays.map((day, idx) => (
                <TabsContent key={day.id} value={String(idx)} className="mt-4">
                  <DayCard
                    day={day}
                    dayIndex={idx}
                    areaOptions={areaOptions}
                    onUpdateDay={updateDay}
                    onRemoveDay={removeDay}
                    onAddExercise={addExercise}
                    onUpdateExercise={updateExercise}
                    onRemoveExercise={removeExercise}
                    onReorderExercises={reorderExercises}
                    isOnlyDay={workoutDays.length === 1}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop: Accordion */}
          <div className="hidden md:block">
            <Accordion
              type="multiple"
              defaultValue={workoutDays.map((_, idx) => String(idx))}
            >
              {workoutDays.map((day, idx) => (
                <AccordionItem key={day.id} value={String(idx)}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {day.dayName || `Day ${idx + 1}`}
                      </span>
                      {day.area && (
                        <Badge variant="secondary">{day.area}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        ({day.exercises.length} exercises)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <DayCard
                      day={day}
                      dayIndex={idx}
                      areaOptions={areaOptions}
                      onUpdateDay={updateDay}
                      onRemoveDay={removeDay}
                      onAddExercise={addExercise}
                      onUpdateExercise={updateExercise}
                      onRemoveExercise={removeExercise}
                      onReorderExercises={reorderExercises}
                      isOnlyDay={workoutDays.length === 1}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1 md:flex-initial">
          {submitLabel || (initialData ? "Update Program" : "Create Program")}
        </Button>
        {!initialData && (
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="flex-1 md:flex-initial"
          >
            Reset
          </Button>
        )}
      </div>
    </form>
  );
}
