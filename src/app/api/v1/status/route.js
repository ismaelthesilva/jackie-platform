import database from "infra/database.js";

export async function GET(request) {
  const result = await database.query("SELECT 3 + 1 AS sum;");
  console.log(result.rows);
  return Response.json({
    status: "ok",
    calculation: result.rows[0].sum,
  });
}
