"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Exercise {
  id: string;
  name: string;
  videoUrl?: string | null;
  description?: string | null;
  muscleGroup?: string | null;
  difficulty?: string | null;
}

interface ExerciseSelectorProps {
  value?: Exercise | null;
  onSelect: (exercise: Exercise) => void;
  placeholder?: string;
  className?: string;
}

export function ExerciseSelector({
  value,
  onSelect,
  placeholder = "Select exercise...",
  className,
}: ExerciseSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topExercises, setTopExercises] = useState<Exercise[]>([]);
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    value || null,
  );
  const [infoDialogExercise, setInfoDialogExercise] = useState<Exercise | null>(
    null,
  );

  // Fetch top 40 exercises on mount
  useEffect(() => {
    async function fetchTopExercises() {
      try {
        setIsLoadingTop(true);
        const response = await fetch("/api/v1/exercises/top?limit=40");
        if (response.ok) {
          const data = await response.json();
          setTopExercises(data.exercises || []);
        }
      } catch (error) {
        console.error("Failed to fetch top exercises:", error);
      } finally {
        setIsLoadingTop(false);
      }
    }
    fetchTopExercises();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/v1/exercises/search?q=${encodeURIComponent(searchQuery)}&limit=50`,
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.exercises || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const displayedExercises = useMemo(() => {
    return searchQuery.length >= 2 ? searchResults : topExercises;
  }, [searchQuery, searchResults, topExercises]);

  const handleSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    onSelect(exercise);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(true)}
        >
          <span className="truncate">
            {selectedExercise?.name || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
            <DialogDescription>
              Search from 800+ exercises or choose from top recommendations
            </DialogDescription>
          </DialogHeader>

          <Command shouldFilter={false} className="rounded-lg border">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            <CommandList className="max-h-[400px]">
              {isLoadingTop && searchQuery.length < 2 ? (
                <div className="py-6 text-center text-sm">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </div>
              ) : displayedExercises.length === 0 ? (
                <CommandEmpty>
                  {searchQuery.length >= 2
                    ? "No exercises found"
                    : "Start typing to search"}
                </CommandEmpty>
              ) : (
                <CommandGroup
                  heading={
                    searchQuery.length >= 2
                      ? `Search Results (${displayedExercises.length})`
                      : "Top 40 Exercises"
                  }
                >
                  {displayedExercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      value={exercise.id}
                      onSelect={() => handleSelect(exercise)}
                      className="flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            selectedExercise?.id === exercise.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {exercise.name}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {exercise.muscleGroup && (
                              <Badge variant="secondary" className="text-xs">
                                {exercise.muscleGroup}
                              </Badge>
                            )}
                            {exercise.difficulty && (
                              <Badge variant="outline" className="text-xs">
                                {exercise.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoDialogExercise(exercise);
                        }}
                      >
                        Info
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Exercise Info Dialog */}
      <Dialog
        open={!!infoDialogExercise}
        onOpenChange={(open) => !open && setInfoDialogExercise(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoDialogExercise?.name}</DialogTitle>
            <DialogDescription>
              {infoDialogExercise?.description || "No description available"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {infoDialogExercise?.muscleGroup && (
                <div>
                  <div className="text-sm font-medium">Muscle Group</div>
                  <div className="text-sm text-muted-foreground">
                    {infoDialogExercise.muscleGroup}
                  </div>
                </div>
              )}
              {infoDialogExercise?.difficulty && (
                <div>
                  <div className="text-sm font-medium">Difficulty</div>
                  <div className="text-sm text-muted-foreground">
                    {infoDialogExercise.difficulty}
                  </div>
                </div>
              )}
            </div>
            {infoDialogExercise?.videoUrl && (
              <div>
                <div className="text-sm font-medium mb-2">Video</div>
                <video
                  src={infoDialogExercise.videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
