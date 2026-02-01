import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log("Finding duplicates...");

    // Find all duplicate names
    const duplicates: { name: string; count: bigint }[] =
      await prisma.$queryRaw`
      SELECT name, COUNT(*) as count 
      FROM exercises 
      GROUP BY name 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC
    `;

    console.log(`Found ${duplicates.length} duplicate names`);

    for (const dup of duplicates) {
      const name = dup.name;
      const count = Number(dup.count);
      console.log(`\nProcessing: ${name} (${count} duplicates)`);

      // Get all exercises with this name, ordered by created date (keep oldest)
      const exercises = await prisma.exercise.findMany({
        where: { name },
        orderBy: { createdAt: "asc" },
      });

      // Keep the first one, delete the rest
      const toKeep = exercises[0];
      const toDelete = exercises.slice(1);

      console.log(`  Keeping ID: ${toKeep.id} (created: ${toKeep.createdAt})`);

      for (const ex of toDelete) {
        console.log(`  Deleting ID: ${ex.id} (created: ${ex.createdAt})`);
        await prisma.exercise.delete({ where: { id: ex.id } });
      }
    }

    // Verify
    const remaining: { name: string; count: bigint }[] = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count 
      FROM exercises 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `;

    if (remaining.length === 0) {
      console.log("\n✅ All duplicates removed successfully!");
    } else {
      console.log("\n⚠️  Still have duplicates:", remaining.length);
    }

    const total = await prisma.exercise.count();
    console.log(`\nTotal exercises remaining: ${total}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();
