require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.workoutProgram.findMany({
    include: { workoutDays: { include: { workoutExercises: true } } },
  });
  console.log(JSON.stringify(programs, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
