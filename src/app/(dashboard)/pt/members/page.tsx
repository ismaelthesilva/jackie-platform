import Link from "next/link";

export default function PtMembersPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">PT — Members</h2>
      <p className="mb-3">Trainer area for managing members.</p>
      <ul className="space-y-2">
        <li>
          <Link
            href="/pt/members/new"
            className="text-blue-600 hover:underline"
          >
            Create new member
          </Link>
        </li>
        <li>
          <Link
            href="/pt/members/123"
            className="text-blue-600 hover:underline"
          >
            Example member detail (/pt/members/123)
          </Link>
        </li>
      </ul>
    </div>
  );
}
