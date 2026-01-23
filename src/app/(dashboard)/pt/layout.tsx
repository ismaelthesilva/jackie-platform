import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import PtNavbar from "./PtNavbar";

export default async function PTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Protect PT routes
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "PT") {
    redirect("/members");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Jackie Fitness - PT Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.email}
              </span>
              <form action="/api/v1/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <PtNavbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
