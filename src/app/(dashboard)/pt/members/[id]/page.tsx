import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: { id: string };
};

export default async function PtMemberDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) return <div className="p-6">Not authenticated</div>;

  if (session.role !== "PT") {
    return redirect("/member/me");
  }

  const member = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!member) return notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{member.name}</h2>
      <div className="text-sm text-gray-600">{member.email}</div>
      <div className="text-sm text-gray-500">
        Joined {new Date(member.createdAt).toLocaleDateString()}
      </div>
      <div className="pt-4">
        <Link href="/pt/members">
          <Button>Back to members</Button>
        </Link>
      </div>
    </div>
  );
}
