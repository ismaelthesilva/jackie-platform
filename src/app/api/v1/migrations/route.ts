import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    type Migration = {
      id: string;
      checksum: string;
      finished_at: Date | null;
      migration_name: string;
      logs: string | null;
      rolled_back_at: Date | null;
      started_at: Date;
      applied_steps_count: number;
    };

    // Get list of applied migrations from Prisma
    const migrations = await prisma.$queryRaw<Array<Migration>>`
      SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC;
    `;

    return NextResponse.json({
      migrations: migrations.map((m: Migration) => ({
        id: m.id,
        name: m.migration_name,
        status: m.rolled_back_at
          ? "rolled_back"
          : m.finished_at
            ? "applied"
            : "pending",
        started_at: m.started_at,
        finished_at: m.finished_at,
        rolled_back_at: m.rolled_back_at,
        applied_steps: m.applied_steps_count,
      })),
      total: migrations.length,
    });
  } catch (error) {
    console.error("Failed to fetch migrations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch migrations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "apply") {
      // Note: In production, you should use Prisma CLI or a migration service
      // This is just for showing pending migrations
      return NextResponse.json(
        {
          message:
            "Migration application should be done via Prisma CLI: npx prisma migrate deploy",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Invalid action. Use 'apply' to run migrations.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Migration operation failed:", error);
    return NextResponse.json(
      {
        error: "Migration operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
