import Link from "next/link";

export default function PtNavbar() {
  return (
    <nav className="bg-gray-900 text-white px-4 py-2 mb-6 flex gap-6 items-center">
      <Link href="/pt" className="hover:underline font-semibold">
        Dashboard
      </Link>
      <Link href="/pt/exercises" className="hover:underline">
        Exercise
      </Link>
      <Link href="/pt/workouts" className="hover:underline">
        Workout
      </Link>
      <Link href="/pt/members" className="hover:underline">
        Members
      </Link>
    </nav>
  );
}
