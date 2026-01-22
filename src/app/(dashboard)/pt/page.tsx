import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Users, ClipboardList } from "lucide-react";

export default function PTDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to Your Dashboard
        </h2>
        <p className="mt-2 text-gray-600">
          Manage your exercises, create workout programs, and track your
          members.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Exercise Library Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Dumbbell className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Exercise Library</CardTitle>
            <CardDescription>
              Create and manage your exercise db with video tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pt/exercises">
              <Button className="w-full">Manage Exercises</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Workout Programs Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <ClipboardList className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Workout Programs</CardTitle>
            <CardDescription>
              Build custom workout programs for your members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pt/workouts">
              <Button className="w-full">Manage Workouts</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              View and manage your member accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pt/members">
              <Button className="w-full">Manage Members</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
