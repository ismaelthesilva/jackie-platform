import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function PtMembersPage() {
  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">PT — Members</h2>
      <p className="mb-3">Trainer area for managing members.</p>
      <div className="mb-4">
        <Link href="/pt/members/new" className="text-blue-600 hover:underline">
          Create new member
        </Link>
      </div>
      {members.length === 0 ? (
        <div className="text-gray-500">No members found.</div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <span className="font-semibold">{m.name}</span>
                <span className="ml-2 text-sm text-gray-600">{m.email}</span>
                <span className="ml-2 text-xs text-gray-400">
                  Joined {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 md:mt-0">
                <Link
                  href={`/pt/members/${m.id}`}
                  className="text-blue-600 hover:underline mr-4"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
