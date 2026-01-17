import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const updatedAt = new Date().toISOString();

    // Test database connection with a simple query
    await prisma.$connect();

    // Get database version
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;
    const databaseVersion = versionResult[0]?.version || "Unknown";

    // Get max connections
    const maxConnectionsResult = await prisma.$queryRaw<
      Array<{ max_connections: string }>
    >`
      SHOW max_connections;
    `;
    const maxConnections = parseInt(
      maxConnectionsResult[0]?.max_connections || "0",
    );

    // Get current connections count
    const connectionsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database();
    `;
    const openedConnections = Number(connectionsResult[0]?.count || 0);

    return NextResponse.json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          status: "healthy",
          version: databaseVersion,
          max_connections: maxConnections,
          opened_connections: openedConnections,
        },
      },
    });
  } catch (error) {
    console.error("Database status check failed:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
