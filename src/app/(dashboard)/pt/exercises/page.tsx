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
  level: string | null;
  primaryMuscles: string[];
  instructions: string[];
  images: string[];
  createdAt: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [showTop, setShowTop] = useState(true);

  // Unified fetch function for all exercises (Top 40 or filtered)
  const fetchExercises = async ({
    name = "",
    area = "",
    page = 1,
    reset = false,
    isTop40 = false,
  }: {
    name?: string;
    area?: string;
    page?: number;
    reset?: boolean;
    isTop40?: boolean;
  }) => {
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      setError("");

      const query = new URLSearchParams();
      if (name) query.set("name", name);
      if (area) query.set("area", area);
      query.set("page", String(page));

      // For Top 40 view, use first page with 40 items limit
      if (isTop40) {
        query.set("pageSize", "40");
        query.set("page", "1");
      } else {
        query.set("pageSize", String(pageSize));
      }

      const url = `/api/v1/exercises?${query}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();

      if (reset) {
        setExercises(data.exercises);
      } else {
        setExercises((prev) => [...prev, ...data.exercises]);
      }
      setTotal(data.total || 0);

      if (isTop40) {
        setPage(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exercises");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load - fetch Top 40
  useEffect(() => {
    fetchExercises({ reset: true, isTop40: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search/filter changes
  useEffect(() => {
    if (search || area) {
      // User is searching/filtering, switch to paginated mode
      setShowTop(false);
      setPage(1);
      fetchExercises({ name: search, area, page: 1, reset: true });
    } else if (!showTop) {
      // Search cleared, go back to Top 40
      setShowTop(true);
      fetchExercises({ reset: true, isTop40: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, area]);

  // Infinite scroll handler (paginated mode only)
  useEffect(() => {
    if (showTop) return; // Don't scroll load in Top 40 mode

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !isLoadingMore &&
        exercises.length < total
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchExercises({ name: search, area, page: nextPage, reset: false });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, isLoadingMore, total, page, search, area, showTop]);

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

      // Refresh list based on current mode
      if (showTop) {
        fetchExercises({ reset: true, isTop40: true });
      } else {
        fetchExercises({ name: search, area, page: 1, reset: true });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete exercise");
    }
  };

  // Handle search/filter submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTop(false);
    setPage(1);
    fetchExercises({ name: search, area, page: 1, reset: true });
  };

  // Handle Top 40 toggle
  const handleShowTop = () => {
    setShowTop(true);
    setSearch("");
    setArea("");
    setPage(1);
    fetchExercises({ reset: true, isTop40: true });
  };

  // Area options
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
        <Button
          variant={showTop ? "default" : "outline"}
          onClick={handleShowTop}
        >
          Top 40
        </Button>
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
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {!showTop && isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
          {!showTop && exercises.length < total && !isLoadingMore && (
            <div className="flex justify-center py-4">
              <Button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchExercises({
                    name: search,
                    area,
                    page: nextPage,
                    reset: false,
                  });
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
