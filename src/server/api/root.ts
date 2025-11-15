import { createTRPCRouter } from './trpc';
import { studentRouter } from './routers/student';
import { courseRouter } from './routers/course';
import { attendanceRouter } from './routers/attendance';
import { authRouter } from './routers/auth';
import { paymentRouter } from './routers/payment';
import { staffRouter } from './routers/staff';

export const appRouter = createTRPCRouter({
  student: studentRouter,
  course: courseRouter,
  attendance: attendanceRouter,
  auth: authRouter,
  payment: paymentRouter,
  staff: staffRouter,
});

export type AppRouter = typeof appRouter;