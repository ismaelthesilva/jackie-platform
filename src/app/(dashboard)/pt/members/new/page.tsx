import { getSession } from "@/lib/auth/session";
import NewMemberForm from "./Form";
import { redirect } from "next/navigation";

export default async function NewMemberPage() {
  const session = await getSession();
  if (!session) return <div className="p-6">Not authenticated</div>;

  if (session.role !== "PT") {
    return redirect("/member/me");
  }

  return <NewMemberForm />;
}
