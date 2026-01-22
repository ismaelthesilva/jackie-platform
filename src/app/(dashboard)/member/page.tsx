import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function MemberRoot() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="font-medium">Not authenticated</div>
          <div className="mt-2">Please sign in to continue.</div>
        </div>
      </div>
    );
  }

  if (session.role === "PT") {
    return redirect("/pt/members");
  }

  if (session.role === "MEMBER") {
    return redirect("/member/me");
  }

  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <div className="text-center text-gray-600">
        <div className="font-medium">Access denied</div>
        <div className="mt-2">You do not have access to this area.</div>
      </div>
    </div>
  );
}
