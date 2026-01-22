import ImageMotion from "@/components/exercises/ImageMotion";

export default function WorkoutProgramCard({ program }: { program: any }) {
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">{program.name}</h3>
      <p className="text-sm text-gray-600">{program.description}</p>
      <div className="mt-2 space-y-2">
        {program.workoutDays.map((d: any) => (
          <div key={d.id}>
            <div className="font-medium">{d.dayName}</div>
            {d.workoutExercises.map((we: any) => (
              <div key={we.id} className="flex gap-3 items-start">
                <div className="w-36">
                  <ImageMotion
                    images={we.exercise?.images ?? []}
                    videoUrl={we.exercise?.videoUrl}
                    alt={we.exercise?.name ?? ""}
                  />
                </div>
                <div>
                  <div>{we.exercise?.name ?? we.exerciseId}</div>
                  <div className="text-sm text-gray-600">
                    {we.sets ?? ""} x {we.reps ?? ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
