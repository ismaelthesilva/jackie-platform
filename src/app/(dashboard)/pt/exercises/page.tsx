"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import ExerciseCard from "@/components/exercises/ExerciseCard";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string;
  muscleGroup: string | null;
  difficulty: string | null;
  createdAt: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    fetchTopExercises();
  }, []);

  // Fetch top 20 most used exercises
  const fetchTopExercises = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/exercises/top");
      if (!response.ok) throw new Error("Failed to fetch top exercises");
      const data = await response.json();
      setExercises(data.exercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exercises");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exercises by search/filter
  const fetchExercises = async (params?: { name?: string; area?: string }) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (params?.name) query.set("name", params.name);
      if (params?.area) query.set("area", params.area);
      const url = `/api/v1/exercises${query.toString() ? `?${query}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();
      setExercises(data.exercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exercises");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/exercises/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete exercise");
      }

      // Refresh list
      fetchTopExercises();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete exercise");
    }
  };

  // Handle search/filter submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises({ name: search, area });
  };

  // Area options (example)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search/Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Exercise Library</h2>
          <p className="mt-2 text-gray-600">
            Manage your exercise database with video tutorials
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Areas</option>
            {areaOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>
        <Link href="/pt/exercises/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Exercises Yet</CardTitle>
            <CardDescription>
              Get started by creating your first exercise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pt/exercises/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Exercise
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
