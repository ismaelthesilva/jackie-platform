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
          images={(() => {
            const imgs = (exercise as any).images;
            if (Array.isArray(imgs) && imgs.length > 0) {
              return imgs.map((img: string) => {
                if (img.startsWith("http")) return img;
                if (img.startsWith("/")) return img;
                if (img.startsWith("exercises/")) return `/${img}`;
                return `/exercises/${img}`;
              });
            }
            // If no images, try to use default convention: /exercises/{id}/0.jpg and /exercises/{id}/1.jpg
            const id = (exercise as any).id;
            return [`/exercises/${id}/0.jpg`, `/exercises/${id}/1.jpg`];
          })()}
          alt={exercise.name}
        />
        {exercise.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {exercise.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
