import Link from "next/link";
import { useState } from "react";
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
import { Edit, Trash2, Play, Info, ChevronDown, ChevronUp } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ImageMotion from "./ImageMotion";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string;
  muscleGroup: string | null;
  difficulty: string | null;
  level: string | null;
  primaryMuscles: string[];
  instructions: string[];
  images: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
}

export default function ExerciseCard({
  exercise,
  onDelete,
}: ExerciseCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const difficultyColors: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-green-50 text-green-700 border-green-200",
    intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    advanced: "bg-red-50 text-red-700 border-red-200",
    expert: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>

        {/* Instructions Button, Level, and Muscle Group in a row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Instructions Button */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 mr-1" />(
                  {exercise.instructions.length})
                </>
              )}
            </Button>
          )}

          {/* Level Badge */}
          {exercise.level && (
            <Badge
              className={levelColors[exercise.level.toLowerCase()] || "border"}
              variant="outline"
            >
              {exercise.level}
            </Badge>
          )}

          {/* Difficulty Badge */}
          {exercise.difficulty && (
            <Badge
              className={difficultyColors[exercise.difficulty] || ""}
              variant="secondary"
            >
              {exercise.difficulty}
            </Badge>
          )}

          {/* Muscle Group */}
          {exercise.muscleGroup && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              🎯 {exercise.muscleGroup}
            </Badge>
          )}

          {/* Primary Muscles */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              💪 {exercise.primaryMuscles.join(", ")}
            </Badge>
          )}
        </div>

        {/* Instructions Content */}
        {showInstructions &&
          exercise.instructions &&
          exercise.instructions.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <ImageMotion
          images={(() => {
            const imgs = exercise.images;
            if (Array.isArray(imgs) && imgs.length > 0) {
              return imgs.map((img: string) => {
                if (img.startsWith("http")) return img;
                if (img.startsWith("/")) return img;
                if (img.startsWith("exercises/")) return `/${img}`;
                return `/exercises/${img}`;
              });
            }
            // If no images, try to use default convention: /exercises/{id}/0.jpg and /exercises/{id}/1.jpg
            const id = exercise.id;
            return [`/exercises/${id}/0.jpg`, `/exercises/${id}/1.jpg`];
          })()}
          alt={exercise.name}
        />

        {exercise.description && (
          <DescriptionPreview description={exercise.description} />
        )}
      </CardContent>
    </Card>
  );
}

// Show only first 2 lines of description, with 'Show more' button
function DescriptionPreview({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  // Split by line or period, fallback to 2 lines
  const lines = description.split(/\n|\r|(?<=\.) /g);
  const preview = lines.slice(0, 2).join(" ");
  const isLong = lines.length > 2;
  return (
    <div className="mt-2">
      <p className="text-sm text-gray-600">
        {expanded || !isLong ? description : preview + "..."}
      </p>
      {isLong && (
        <Button
          variant="link"
          className="px-0 text-xs"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
}
