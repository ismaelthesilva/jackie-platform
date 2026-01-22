import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MemberDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    return <div className="p-6">Not authenticated</div>;
  }
  // Allow PTs, or allow a MEMBER to view their own detail page
  if (session.role !== "PT") {
    if (session.role === "MEMBER" && session.userId === params.id) {
      // allow
    } else {
      return redirect("/members/me");
    }
  }

  const member = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!member) return <div className="p-6">Member not found</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{member.name}</h2>
      <div className="text-sm text-gray-600">{member.email}</div>
      <div className="text-sm text-gray-500">
        Joined {new Date(member.createdAt).toLocaleDateString()}
      </div>
      <div className="pt-4">
        <Link href="/members">
          <Button>Back to members</Button>
        </Link>
      </div>
    </div>
  );
}
