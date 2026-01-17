🎯 Jackie Fitness Platform - MVP Plan
Project: React Next.js Fitness Application  
Stack: Next.js (App Router), Neon (PostgreSQL Database), Neon Auth, Prisma ORM, Tailwind/Shadcn UI.

📋 Project Overview
A fitness platform where Personal Trainers (PTs) can create workout programs with video tutorials for their members. Members can view assigned workouts and watch instructional videos.

🏗️ 1. Database Schema (Prisma)
The schema will be defined in `prisma/schema.prisma` and managed through Prisma migrations.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String            @id @default(uuid())
  email             String            @unique
  name              String
  password          String
  role              Role              @default(MEMBER)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  createdExercises  Exercise[]        @relation("ExerciseCreator")
  createdPrograms   WorkoutProgram[]  @relation("ProgramCreator")
  assignedPrograms  WorkoutProgram[]  @relation("ProgramAssignee")

  @@map("users")
}

enum Role {
  PT
  MEMBER
}

model Exercise {
  id              String            @id @default(uuid())
  name            String
  videoUrl        String
  description     String?
  muscleGroup     String?
  createdById     String
  createdAt       DateTime          @default(now())

  createdBy       User              @relation("ExerciseCreator", fields: [createdById], references: [id])
  workoutExercises WorkoutExercise[]

  @@map("exercises")
}

model WorkoutProgram {
  id          String        @id @default(uuid())
  name        String
  description String?
  createdById String
  assignedToId String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  createdBy   User          @relation("ProgramCreator", fields: [createdById], references: [id])
  assignedTo  User?         @relation("ProgramAssignee", fields: [assignedToId], references: [id])
  workoutDays WorkoutDay[]

  @@map("workout_programs")
}

model WorkoutDay {
  id              String            @id @default(uuid())
  programId       String
  dayName         String
  orderIndex      Int
  createdAt       DateTime          @default(now())

  program         WorkoutProgram    @relation(fields: [programId], references: [id], onDelete: Cascade)
  workoutExercises WorkoutExercise[]

  @@map("workout_days")
}

model WorkoutExercise {
  id            String      @id @default(uuid())
  workoutDayId  String
  exerciseId    String
  orderIndex    Int
  sets          Int?
  reps          String?
  notes         String?

  workoutDay    WorkoutDay  @relation(fields: [workoutDayId], references: [id], onDelete: Cascade)
  exercise      Exercise    @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@map("workout_exercises")
}
```

📂 Project Structure
Proposed folder structure for the Next.js App Router.

src/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ └── register/
│ │ └── page.tsx
│ ├── (dashboard)/
│ │ ├── layout.tsx # Protected layout with Sidebar/Nav
│ │ ├── pt/
│ │ │ ├── page.tsx # PT Dashboard Home
│ │ │ ├── exercises/
│ │ │ │ ├── page.tsx # List (Library)
│ │ │ │ ├── new/ # Create Form
│ │ │ │ │ └── page.tsx
│ │ │ │ └── [id]/
│ │ │ │ └── edit/ # Edit Form
│ │ │ │ └── page.tsx
│ │ │ ├── workouts/
│ │ │ │ ├── page.tsx # Program List
│ │ │ │ ├── new/ # Create Program
│ │ │ │ │ └── page.tsx
│ │ │ │ └── [id]/
│ │ │ │ ├── page.tsx # View/Edit Program
│ │ │ │ └── assign/ # Assign to Member
│ │ │ │ └── page.tsx
│ │ │ └── members/
│ │ │ └── page.tsx # Member List & Status
│ │ └── member/
│ │ ├── page.tsx # Member Dashboard (Current Program)
│ │ └── workout/
│ │ └── [dayId]/
│ │ └── page.tsx # The 'Player' View
│ ├── api/
│ │ └── v1/
│ │ ├── exercises/
│ │ ├── workouts/
│ │ └── members/
│ └── layout.tsx
├── components/
│ ├── auth/
│ │ ├── LoginForm.tsx
│ │ └── RegisterForm.tsx
│ ├── exercises/
│ │ ├── ExerciseCard.tsx
│ │ ├── ExerciseForm.tsx
│ │ └── VideoPlayer.tsx
│ ├── workouts/
│ │ ├── WorkoutDayCard.tsx
│ │ ├── ExerciseList.tsx
│ │ └── WorkoutBuilder.tsx
│ └── ui/ # Shadcn UI components
├── lib/
│ ├── prisma.ts # Prisma client singleton
│ ├── auth/
│ │ ├── session.ts # Session management
│ │ ├── password.ts # Password hashing (bcrypt)
│ │ └── middleware.ts # Auth middleware
│ └── utils/
│ ├── videoUtils.ts # YouTube ID extraction logic
│ └── auth.ts
├── prisma/
│ ├── schema.prisma # Database schema
│ └── migrations/ # Prisma migrations
└── types/
└── auth.ts # Auth types

🚀 Implementation Roadmap (Checklist)
Phase 1: Setup & Authentication (Week 1)
[ ] Infrastructure

[ ] Initialize Next.js project.

[ ] Setup Neon PostgreSQL project.

[ ] Install Prisma: `npm install prisma @prisma/client @neondatabase/serverless`

[ ] Initialize Prisma: `npx prisma init`

[ ] Configure Environment Variables (.env).

[ ] Create Prisma schema.

[ ] Run Prisma Migrations: `npx prisma migrate dev --name init`

Auth Implementation

[ ] Install bcrypt: `npm install bcryptjs @types/bcryptjs`

[ ] Create User model in Prisma schema.

[ ] Create Registration Page (Name, Email, Password, Role Selection).

[ ] Create Login Page.

[ ] Implement API route for registration (hash password with bcrypt).

[ ] Implement API route for login (verify password, create session).

[ ] Setup session management (JWT or next-auth).

[ ] Implement middleware.ts for route protection.

[ ] Implement Role-Based Redirects (PT -> /pt, Member -> /member).

Phase 2: PT - Exercise Library (Week 1-2)
[ ] Backend

[ ] Create API Route: GET /api/exercises

[ ] Create API Route: POST /api/exercises

[ ] Create API Route: PUT/DELETE /api/exercises

[ ] Frontend

[ ] Build ExerciseForm component.

[ ] Implement YouTube URL parser (Utils).

[ ] Implement YouTube Video Preview component.

[ ] Build ExerciseList page with Muscle Group filtering.

[ ] Add Edit/Delete functionality.

Phase 3: PT - Workout Builder (Week 2-3)
[ ] Backend

[ ] CRUD API for Workout Programs.

[ ] Logic to handle nested inserts (Days -> Exercises).

[ ] Frontend

[ ] Build Workout Program creation form.

[ ] Create UI for adding "Days" (Mon, Tue, etc).

[ ] Create "Exercise Picker" modal to add exercises to days.

[ ] Implement Reordering (Drag & Drop or Up/Down arrows).

[ ] Add input fields for Sets, Reps, and Notes.

Phase 4: PT - Member Management (Week 3)
[ ] Backend

[ ] API to fetch users with role = 'member'.

[ ] API to update assigned_to field in workout programs.

[ ] Frontend

[ ] Build Member List page.

[ ] Create Assignment UI (Select Member dropdown on Workout Card).

[ ] View assigned workouts per member.

Phase 5: Member Dashboard (Week 4)
[ ] Dashboard

[ ] Fetch the workout program where assigned_to == current_user_id.

[ ] Display weekly schedule (Monday - Sunday).

[ ] Workout Player

[ ] Create the "Day View" (List of exercises for that day).

[ ] Embed YouTube Player for the active exercise.

[ ] Display Sets/Reps/Notes clearly.

Phase 6: Polish & Testing (Week 4-5)
[ ] UX Improvements

[ ] Add Loading Skeletons for data fetching.

[ ] Add Toast notifications (Success/Error).

[ ] Add Form Validation (Zod + React Hook Form).

[ ] Quality Assurance

[ ] Verify Mobile Responsiveness (Critical for gym usage).

[ ] Test RLS Policies (Ensure Members can't see other members' data).

[ ] Deploy to Vercel/Netlify.

📝 Technical Notes
YouTube Video Handling
Helper function logic for lib/utils/videoUtils.ts:

Extract ID: Parse the 11-character ID from standard URL formats.

https://www.youtube.com/watch?v=VIDEO_ID

https://youtu.be/VIDEO_ID

https://www.youtube.com/embed/VIDEO_ID

Display: always use https://www.youtube.com/embed/{videoId} for the iframe source.

Database Security with Prisma
Implement authorization logic in your API routes:

**Exercises:**

- PT can create, read, update, delete their own exercises
- Members can only read exercises

**Workout Programs:**

- PT can CRUD programs they created
- Members can only read programs assigned to them

**Example Prisma Query with Authorization:**

```typescript
// Get programs for current user based on role
const programs = await prisma.workoutProgram.findMany({
  where:
    user.role === "PT" ? { createdById: user.id } : { assignedToId: user.id },
});
```

Environment Variables

```env
DATABASE_URL=postgresql://[user]:[password]@[neon-host]/[database]?sslmode=require
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

🔮 Future Enhancements (Post-MVP)
[ ] Progress Tracking: Input actual weight lifted/reps done.

[ ] Visuals: Checkmarks for completed exercises.

[ ] History: View past workouts.

[ ] Chat: PT-Member messaging system.

[ ] Categories: Advanced tagging for exercises.
