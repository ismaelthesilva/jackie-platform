import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Calendar, Mail, Dumbbell, Eye } from "lucide-react";

export default async function PtMembersPage() {
  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      assignedPrograms: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your training clients
          </p>
        </div>
        <Link href="/pt/members/new">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Members</CardDescription>
          <CardTitle className="text-4xl">{members.length}</CardTitle>
        </CardHeader>
      </Card>

      {/* Members Grid */}
      {members.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No members found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first member to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <Card key={m.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{m.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{m.email}</span>
                    </CardDescription>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Joined {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Assigned Programs */}
                {m.assignedPrograms && m.assignedPrograms.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Dumbbell className="h-3 w-3" />
                      <span>
                        Workout Programs ({m.assignedPrograms.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.assignedPrograms.map((p) => (
                        <Badge
                          key={p.id}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-xs text-muted-foreground italic">
                    No programs assigned yet
                  </div>
                )}

                {/* Actions */}
                <Link href={`/pt/members/${m.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
