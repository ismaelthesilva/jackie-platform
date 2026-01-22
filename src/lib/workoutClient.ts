export async function createProgram(payload: any) {
  const res = await fetch("/api/v1/workouts", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Create failed (${res.status})`);
  return body;
}

export async function updateProgram(id: string, payload: any) {
  const res = await fetch(`/api/v1/workouts/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Update failed (${res.status})`);
  return body;
}

export async function deleteProgram(id: string) {
  const res = await fetch(`/api/v1/workouts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Delete failed (${res.status})`);
  return body;
}
