import { Client, QueryResult, QueryResultRow } from "pg";

async function query<T extends QueryResultRow = any>(
  queryObject: string | { text: string; values?: any[] }
): Promise<QueryResult<T>> {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  await client.connect();

  try {
    const result = await client.query<T>(queryObject);
    return result;
  } finally {
    await client.end();
  }
}

export default {
  query,
};
