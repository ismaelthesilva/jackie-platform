import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ImageMotion from "./ImageMotion";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string;
  muscleGroup: string | null;
  difficulty: string | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
}

export default function ExerciseCard({
  exercise,
  onDelete,
}: ExerciseCardProps) {
  const difficultyColors: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          {exercise.difficulty && (
            <Badge
              className={difficultyColors[exercise.difficulty] || ""}
              variant="secondary"
            >
              {exercise.difficulty}
            </Badge>
          )}
        </div>
        {exercise.muscleGroup && (
          <CardDescription className="text-sm">
            {exercise.muscleGroup}
          </CardDescription>
        )}
      </CardHeader>

      {/* <CardContent className="flex-1 pb-3">
        <div className="aspect-video mb-3 bg-gray-100 rounded-md overflow-hidden">
          <VideoPlayer videoUrl={exercise.videoUrl} />
        </div>
        {exercise.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {exercise.description}
          </p>
        )}
      </CardContent> */}

      <CardContent className="flex-1 pb-3">
        <ImageMotion
          images={(exercise as any).images}
          videoUrl={exercise.videoUrl}
          alt={exercise.name}
        />
        {exercise.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {exercise.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        <Link href={`/pt/exercises/${exercise.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(exercise.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
