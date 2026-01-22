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
("use client");

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewMemberPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/v1/members", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setMessage("Member created");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMessage(err?.message || "Error");
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create Member</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <Button type="submit">Create</Button>
        </div>
        {message && <div className="text-sm text-gray-600">{message}</div>}
      </form>
    </div>
  );
}
