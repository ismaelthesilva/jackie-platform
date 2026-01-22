import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MembersPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="font-medium">Not authenticated</div>
          <div className="mt-2">Please sign in to view members.</div>
        </div>
      </div>
    );
  }

  if (session.role !== "PT") {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="font-medium">Access denied</div>
          <div className="mt-2">You must be a PT to manage members.</div>
        </div>
      </div>
    );
  }

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Members</h2>
          <p className="mt-2 text-gray-600">
            View and manage your member accounts
          </p>
        </div>
        <Link href="/pt/members/new">
          <Button>Create Member</Button>
        </Link>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Members</CardTitle>
            <CardDescription>There are no members yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pt/members/new">
              <Button>Create your first member</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Card key={m.id} className="hover:shadow">
              <CardHeader>
                <CardTitle>{m.name}</CardTitle>
                <CardDescription className="truncate">
                  {m.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Joined {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                  <Link href={`/pt/members/${m.id}`}>
                    <Button>Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
